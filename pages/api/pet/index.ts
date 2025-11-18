import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendConflict,
  sendBadRequest,
  sendServerError,
  validateRequiredFields,
} from '@/lib/api-helpers'

/**
 * GET /api/pet - Retrieve authenticated user's pet
 * POST /api/pet - Create a new pet for authenticated user
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate authentication
  const auth = await requireAuth(req, res)
  if (auth.error) {
    return sendUnauthorized(res, auth.error)
  }

  const { userId } = auth

  try {
    if (req.method === 'GET') {
      return await handleGetPet(userId!, res)
    } else if (req.method === 'POST') {
      return await handleCreatePet(userId!, req, res)
    } else {
      return sendError(res, 405, 'Method Not Allowed', `Method ${req.method} not allowed`)
    }
  } catch (error) {
    console.error('Pet API error:', error)
    return sendServerError(res, 'Failed to process pet request')
  }
}

/**
 * Handle GET request - retrieve user's pet
 */
async function handleGetPet(userId: string, res: NextApiResponse) {
  const pet = await prisma.pet.findUnique({
    where: { userId },
    include: {
      profile: {
        select: {
          username: true,
        },
      },
    },
  })

  if (!pet) {
    return sendNotFound(res, 'Pet')
  }

  return sendSuccess(res, pet)
}

/**
 * Handle POST request - create new pet
 */
async function handleCreatePet(
  userId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate required fields
  const missing = validateRequiredFields(req.body, ['name'])
  if (missing.length > 0) {
    return sendBadRequest(res, `Missing required fields: ${missing.join(', ')}`)
  }

  const { name } = req.body

  // Validate name
  if (typeof name !== 'string' || name.trim().length === 0) {
    return sendBadRequest(res, 'Pet name must be a non-empty string')
  }

  if (name.length > 50) {
    return sendBadRequest(res, 'Pet name must be 50 characters or less')
  }

  // Check if user already has a pet
  const existingPet = await prisma.pet.findUnique({
    where: { userId },
  })

  if (existingPet) {
    return sendConflict(res, 'User already has a pet')
  }

  // Create the pet with default stats
  const pet = await prisma.pet.create({
    data: {
      userId,
      name: name.trim(),
      level: 1,
      experience: 0,
      hunger: 100,
      mood: 100,
    },
  })

  return sendSuccess(res, pet, 201, 'Pet created successfully')
}
