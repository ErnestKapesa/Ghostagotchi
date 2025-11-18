import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  sendSuccess,
  sendUnauthorized,
  sendNotFound,
  sendServerError,
  sendError,
} from '@/lib/api-helpers'

/**
 * POST /api/pet/feed - Feed the user's ghost pet
 * Updates hunger to 100, adds XP, and levels up if threshold reached
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
    // Fetch user's pet
    const pet = await prisma.pet.findUnique({
      where: { userId: userId! },
    })

    if (!pet) {
      return sendNotFound(res, 'Pet')
    }

    // Calculate new stats
    const XP_GAIN = 10
    const newExperience = pet.experience + XP_GAIN
    const newLevel = Math.floor(newExperience / 100) + 1

    // Update pet with new stats
    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: {
        hunger: 100, // Fill hunger completely
        experience: newExperience,
        level: newLevel,
        lastFedAt: new Date(),
      },
    })

    const leveledUp = newLevel > pet.level

    return sendSuccess(
      res,
      {
        pet: updatedPet,
        leveledUp,
        xpGained: XP_GAIN,
      },
      200,
      leveledUp ? `Fed! Your ghost leveled up to ${newLevel}! 🎉` : 'Fed! Your ghost is happy! 👻'
    )
  } catch (error) {
    console.error('Feed pet error:', error)
    return sendServerError(res, 'Failed to feed pet')
  }
}
