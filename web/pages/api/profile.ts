import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import {
  sendSuccess,
  sendUnauthorized,
  sendBadRequest,
  sendConflict,
  sendServerError,
  sendError,
  validateRequiredFields,
} from '@/lib/api-helpers'

/**
 * POST /api/profile - Update user profile (username)
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
    const missing = validateRequiredFields(req.body, ['username'])
    if (missing.length > 0) {
      return sendBadRequest(res, `Missing required fields: ${missing.join(', ')}`)
    }

    const { username } = req.body

    // Validate username
    if (typeof username !== 'string' || username.trim().length === 0) {
      return sendBadRequest(res, 'Username must be a non-empty string')
    }

    if (username.length < 3) {
      return sendBadRequest(res, 'Username must be at least 3 characters')
    }

    if (username.length > 20) {
      return sendBadRequest(res, 'Username must be 20 characters or less')
    }

    // Check for valid characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return sendBadRequest(
        res,
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
    }

    // Check if username is already taken
    const existingProfile = await prisma.profile.findUnique({
      where: { username: username.trim() },
    })

    if (existingProfile && existingProfile.id !== userId) {
      return sendConflict(res, 'Username is already taken')
    }

    // Update or create profile
    const profile = await prisma.profile.upsert({
      where: { id: userId! },
      update: {
        username: username.trim(),
      },
      create: {
        id: userId!,
        username: username.trim(),
      },
    })

    return sendSuccess(res, profile, 200, 'Profile updated successfully')
  } catch (error) {
    console.error('Profile API error:', error)
    return sendServerError(res, 'Failed to update profile')
  }
}
