import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { openai, createGhostPrompt, CHAT_CONFIG } from '@/lib/openai'
import {
  sendSuccess,
  sendUnauthorized,
  sendNotFound,
  sendBadRequest,
  sendServerError,
  sendError,
  validateRequiredFields,
} from '@/lib/api-helpers'

/**
 * POST /api/chat - Chat with the user's ghost using OpenAI
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method Not Allowed', `Method ${req.method} not allowed`)
  }

  // Validate authentication
  const auth = await requireAuth(req, res)
  if (auth.error) {
    return sendUnauthorized(res, auth.error)
  }

  const { userId } = auth

  try {
    // Validate request body
    const missing = validateRequiredFields(req.body, ['message'])
    if (missing.length > 0) {
      return sendBadRequest(res, `Missing required fields: ${missing.join(', ')}`)
    }

    const { message } = req.body

    // Validate message
    if (typeof message !== 'string' || message.trim().length === 0) {
      return sendBadRequest(res, 'Message must be a non-empty string')
    }

    if (message.length > 500) {
      return sendBadRequest(res, 'Message must be 500 characters or less')
    }

    // Fetch user's pet for context
    const pet = await prisma.pet.findUnique({
      where: { userId: userId! },
    })

    if (!pet) {
      return sendNotFound(res, 'Pet')
    }

    // Create prompt with ghost personality
    const messages = createGhostPrompt(pet.name, message.trim())

    // Call OpenAI API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const completion = await openai.chat.completions.create(
        {
          messages,
          ...CHAT_CONFIG,
        },
        {
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      const reply = completion.choices[0]?.message?.content || 
        "Boo! 👻 I seem to have lost my voice for a moment. Try again?"

      // Optionally store the conversation (can be implemented later)
      // await storeMessage(pet.id, 'user', message)
      // await storeMessage(pet.id, 'ghost', reply)

      return sendSuccess(res, {
        reply,
        petName: pet.name,
        tokensUsed: completion.usage?.total_tokens || 0,
      })
    } catch (openaiError: any) {
      clearTimeout(timeoutId)

      if (openaiError.name === 'AbortError') {
        return sendError(
          res,
          408,
          'Request Timeout',
          'The ghost is taking too long to respond. Please try again.'
        )
      }

      console.error('OpenAI API error:', openaiError)
      
      // Return a friendly fallback message
      return sendSuccess(res, {
        reply: "Oops! 👻 My ghostly connection got a bit fuzzy. Can you say that again?",
        petName: pet.name,
        error: 'OpenAI API temporarily unavailable',
      })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return sendServerError(res, 'Failed to process chat message')
  }
}

/**
 * Helper function to store messages (optional, for future use)
 */
async function storeMessage(petId: string, sender: string, message: string) {
  try {
    await prisma.message.create({
      data: {
        petId,
        sender,
        message,
      },
    })
  } catch (error) {
    console.error('Failed to store message:', error)
    // Don't throw - message storage is optional
  }
}
