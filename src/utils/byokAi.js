export const fetchFromByokAI = async (messages, provider, apiKey) => {
  if (provider === 'gemini') {
    return await askGoogleGemini(messages, apiKey);
  } else if (provider === 'deepseek') {
    return await askDeepseek(messages, apiKey);
  } else {
    throw new Error(`Provider ${provider} is not supported locally yet.`);
  }
};

// --- GEMINI DIRECT IMPLEMENTATION ---
const askGoogleGemini = async (messages, apiKey) => {
  // Convert standard {role, content} to Gemini's format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Invalid Gemini API Key or network error.");
  }

  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    throw new Error("The AI refused to answer due to safety restrictions.");
  }

  return candidate?.content?.parts?.[0]?.text || '';
};

// --- DEEPSEEK DIRECT IMPLEMENTATION ---
const askDeepseek = async (messages, apiKey) => {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Invalid DeepSeek API Key.");
  }

  return data.choices[0].message.content;
};