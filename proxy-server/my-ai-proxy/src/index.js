import { Hono } from 'hono';

const app = new Hono();

// ==========================================
// GLOBAL ERROR HANDLER (Prevents 1101 Crashes)
// ==========================================
app.onError((err, c) => {
  console.error("Global Hono Error:", err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================
app.get('/', (c) => c.text('AI Proxy Gateway is active.'));
app.get('/status', (c) => c.json({ status: 'up', timestamp: new Date().toISOString() }));
app.get('/providers', (c) => c.json({ availableProviders: ['gemini', 'deepseek'] }));

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
app.use('/v1/*', async (c, next) => {
  // 🚨 FIX: Correct Hono middleware early-exit pattern
  if (c.req.path === '/v1/register-guest') {
    await next();
    return; // Must return empty here, DO NOT return next()
  }

  const authHeader = c.req.header('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
    return c.json({ error: 'Server configuration missing (Supabase Env Vars)' }, 500);
  }

  const supaRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/users?token=eq.${token}`, {
    headers: {
      "apikey": c.env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${c.env.SUPABASE_SERVICE_KEY}`
    }
  });
  
  const users = await supaRes.json();
  
  if (!users || users.length === 0) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  if (!users[0].is_premium && users[0].quota_remaining <= 0 && c.req.path === '/v1/chat/completions') {
    return c.json({ error: 'Quota Exceeded' }, 403);
  }

  c.set('userId', users[0].id); 
  c.set('user', users[0]);
  await next();
});

// ==========================================
// REGISTRATION ENDPOINT
// ==========================================
app.post('/v1/register-guest', async (c) => {
  const fingerprint = c.req.header('x-device-fingerprint');
  
  if (!fingerprint) {
    return c.json({ error: 'Missing device fingerprint' }, 400);
  }

  // Explicit safety check for Environment Variables
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    return c.json({ error: 'Server missing Supabase credentials' }, 500);
  }

  // Safe fallback for UUID generation
  let newToken;
  try {
    newToken = `guest_${crypto.randomUUID().replace(/-/g, '')}`;
  } catch (e) {
    newToken = `guest_${Math.random().toString(36).substring(2)}${Date.now()}`;
  }

  try {
    const supaRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        "apikey": c.env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: newToken,
        is_premium: false,
        quota_remaining: 5
      })
    });

    if (!supaRes.ok) {
      const errorText = await supaRes.text();
      console.error("Supabase insert failed:", errorText);
      return c.json({ error: 'Failed to create user in Supabase database' }, 500);
    }

    return c.json({ token: newToken });

  } catch (error) {
    console.error("Worker Registration Error:", error);
    return c.json({ error: 'Database Connection Error' }, 500);
  }
});

// ==========================================
// DELETE ACCOUNT ENDPOINT
// ==========================================
app.delete('/v1/user', async (c) => {
  const userId = c.get('userId'); 

  try {
    const supaRes = await fetch(`${c.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        "apikey": c.env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${c.env.SUPABASE_SERVICE_KEY}`
      }
    });

    if (!supaRes.ok) {
      return c.json({ error: 'Failed to delete user from database' }, 500);
    }

    return c.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ==========================================
// UNIFIED CHAT ENDPOINT
// ==========================================
app.post('/v1/chat/completions', async (c) => {
  const user = c.get('user');
  const userId = c.get('userId');
  const provider = c.req.header('x-ai-provider') || 'gemini';
  const body = await c.req.json();

  if (!user.is_premium) {
    c.executionCtx.waitUntil(
      fetch(`${c.env.SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          "apikey": c.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quota_remaining: user.quota_remaining - 1 })
      })
    );
  }

  let result;
  try {
    if (provider === 'gemini') {
      result = await askGemini(body, c.env);
    } else if (provider === 'deepseek') {
      result = await askDeepseek(body, c.env);
    } else {
      return c.json({ error: `Unsupported provider: ${provider}` }, 400);
    }
  } catch (error) {
    return c.json({ error: "Failed to communicate with AI provider" }, 502);
  }

  c.executionCtx.waitUntil(
    logAnalyticsToSupabase(userId, provider, result.tokensUsed, c.env)
  );

  return c.json(result.response);
});

// ==========================================
// AI ADAPTERS & ANALYTICS LOGGER
// ==========================================

async function askGemini(reqBody, env) {
  const geminiContents = [];
  let systemInstruction = null;

  for (const msg of reqBody.messages) {
    if (msg.role === 'system') {
      systemInstruction = { parts: [{ text: msg.content }] };
    } else {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
  }

  const geminiPayload = { contents: geminiContents };
  if (systemInstruction) geminiPayload.system_instruction = systemInstruction;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY
    },
    body: JSON.stringify(geminiPayload)
  });

  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || "Failed to fetch from Gemini");

  const candidate = data.candidates?.[0];
  let responseText = candidate?.finishReason === 'SAFETY' ? "I'm sorry, I cannot fulfill this request due to safety restrictions." : (candidate?.content?.parts?.[0]?.text || '');

  return {
    response: {
      id: `chatcmpl-${crypto.randomUUID()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gemini-3.1-flash-lite-preview',
      choices: [{ index: 0, message: { role: 'assistant', content: responseText }, finish_reason: candidate?.finishReason?.toLowerCase() || 'stop' }],
      usage: { prompt_tokens: data.usageMetadata?.promptTokenCount || 0, completion_tokens: data.usageMetadata?.candidatesTokenCount || 0, total_tokens: data.usageMetadata?.totalTokenCount || 0 }
    },
    tokensUsed: data.usageMetadata?.totalTokenCount || 0
  };
}

async function askDeepseek(reqBody, env) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify(reqBody)
  });
  const data = await response.json();
  return { response: data, tokensUsed: data.usage?.total_tokens || 0 };
}

async function logAnalyticsToSupabase(userId, provider, tokensUsed, env) {
  if (tokensUsed === 0) return;
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/request_logs`, {
      method: 'POST',
      headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, provider: provider, tokens: tokensUsed, created_at: new Date().toISOString() })
    });
  } catch (error) { console.error("Failed to log analytics:", error); }
}

export default app;