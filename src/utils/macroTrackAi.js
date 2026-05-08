import * as SecureStore from 'expo-secure-store';

const PROXY_URL = 'https://macro-track-aiproxy.aryanue195035ece.workers.dev';

export const fetchFromMacroTrackAI = async (messages) => {
  const token = await SecureStore.getItemAsync('userToken');
  
  if (!token) {
    throw new Error("Authentication error. Please log in again.");
  }

  const response = await fetch(`${PROXY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-ai-provider': 'gemini' // Or let the server default to it
    },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle specific server errors (like Quota Exceeded)
    if (response.status === 403 && data.error === 'Quota Exceeded') {
      throw new Error("Free tier limit reached! Upgrade to Premium or use your own API key in Settings.");
    }
    throw new Error(data.error || "Server error occurred.");
  }

  // The server returns the standard OpenAI format
  return data.choices[0].message.content;
};