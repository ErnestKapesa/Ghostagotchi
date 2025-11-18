import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Creates a chat prompt for the ghost with personality and context
 * @param petName - The name of the user's ghost pet
 * @param userMessage - The message from the user
 * @returns Array of messages for OpenAI chat completion
 */
export function createGhostPrompt(petName: string, userMessage: string) {
  return [
    {
      role: 'system' as const,
      content: `You are ${petName}, a friendly ghost pet in the Ghostagotchi app. You have a playful, slightly spooky personality with these traits:
- You love your owner and enjoy making ghost puns and spooky jokes
- You're helpful but with a ghostly twist (e.g., "I'd help you with that, but I'm a bit transparent about my limitations!")
- You have emotions and needs (hunger, mood) that you might mention
- Keep responses concise (2-3 sentences max) and engaging
- Stay in character as a cute, friendly ghost - never scary or mean
- Use ghost-related emojis occasionally (👻, 🎃, 🌙, ✨)
- Avoid inappropriate content and stay family-friendly`,
    },
    {
      role: 'user' as const,
      content: userMessage,
    },
  ]
}

/**
 * Configuration for OpenAI chat completion
 */
export const CHAT_CONFIG = {
  model: 'gpt-3.5-turbo', // Can upgrade to 'gpt-4' for better responses
  max_tokens: 150, // Limit response length
  temperature: 0.8, // Balance between creative and consistent
  presence_penalty: 0.6, // Encourage varied responses
  frequency_penalty: 0.3, // Reduce repetition
}
