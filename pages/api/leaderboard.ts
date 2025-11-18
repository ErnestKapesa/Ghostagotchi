import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { sendSuccess, sendServerError, sendError } from '@/lib/api-helpers'

/**
 * GET /api/leaderboard - Get top pets ranked by level and experience
 * Public endpoint - no authentication required
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method Not Allowed', `Method ${req.method} not allowed`)
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10
    const maxLimit = Math.min(limit, 50) // Cap at 50 entries

    // Fetch top pets with profile information
    const topPets = await prisma.pet.findMany({
      take: maxLimit,
      orderBy: [
        { level: 'desc' },
        { experience: 'desc' },
        { createdAt: 'asc' }, // Older pets rank higher in ties
      ],
      select: {
        id: true,
        name: true,
        level: true,
        experience: true,
        createdAt: true,
        profile: {
          select: {
            username: true,
          },
        },
      },
    })

    // Format leaderboard with ranks and anonymized owners
    const leaderboard = topPets.map((pet, index) => ({
      rank: index + 1,
      ghostName: pet.name,
      level: pet.level,
      experience: pet.experience,
      owner: pet.profile?.username || 'Anonymous Ghost Keeper',
      age: calculateAge(pet.createdAt),
    }))

    return sendSuccess(res, {
      leaderboard,
      total: leaderboard.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return sendServerError(res, 'Failed to fetch leaderboard')
  }
}

/**
 * Calculate how long ago the pet was created
 */
function calculateAge(createdAt: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      return 'Just born'
    }
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} old`
  }

  if (diffDays === 1) {
    return '1 day old'
  }

  if (diffDays < 7) {
    return `${diffDays} days old`
  }

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} old`
  }

  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} old`
}
