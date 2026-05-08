import { fetchFromMacroTrackAI } from './macroTrackAi';
import { fetchFromByokAI } from './byokAi';

/**
 * Main function to process AI requests across the app.
 * @param {Array|String} messages - The chat history or single prompt
 * @param {Object} profile - The user profile from SettingsContext
 */
export const processAiRequest = async (messages, profile) => {
  try {
    // Format input to always be an array of messages
    const formattedMessages = Array.isArray(messages) 
      ? messages 
      : [{ role: 'user', content: messages }];

    if (profile.useMarcoTrackAI) {
      // ------------------------------------------
      // ROUTE A: MacroTrack AI (Your Cloudflare Server)
      // ------------------------------------------
      console.log("[AI Orchestrator] Routing to MacroTrack AI Server...");
      return await fetchFromMacroTrackAI(formattedMessages);

    } else {
      // ------------------------------------------
      // ROUTE B: Bring Your Own Key (Local Device)
      // ------------------------------------------
      console.log("[AI Orchestrator] Routing to BYOK AI...");
      
      const provider = profile.aiProvider || 'gemini';
      const apiKey = profile.aiKeys?.[provider];

      if (!apiKey || apiKey.trim() === '') {
        throw new Error(`API Key missing. Please enter your ${provider} API Key in Settings, or enable MacroTrack AI.`);
      }

      return await fetchFromByokAI(formattedMessages, provider, apiKey);
    }
  } catch (error) {
    console.error("[AI Orchestrator] Error:", error);
    throw error; // Rethrow so the UI can show an alert
  }
};