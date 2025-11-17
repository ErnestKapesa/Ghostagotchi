import { NextApiResponse } from 'next'

export interface ApiError {
  error: string
  message?: string
  code?: string
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: NextApiResponse,
  status: number,
  error: string,
  message?: string,
  code?: string
) {
  return res.status(status).json({
    error,
    message,
    code,
  } as ApiError)
}

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  status: number = 200,
  message?: string
) {
  return res.status(status).json({
    data,
    message,
  } as ApiSuccess<T>)
}

/**
 * Send unauthorized error (401)
 */
export function sendUnauthorized(res: NextApiResponse, message?: string) {
  return sendError(res, 401, 'Unauthorized', message || 'Authentication required')
}

/**
 * Send not found error (404)
 */
export function sendNotFound(res: NextApiResponse, resource: string = 'Resource') {
  return sendError(res, 404, 'Not Found', `${resource} not found`)
}

/**
 * Send conflict error (409)
 */
export function sendConflict(res: NextApiResponse, message: string) {
  return sendError(res, 409, 'Conflict', message)
}

/**
 * Send bad request error (400)
 */
export function sendBadRequest(res: NextApiResponse, message: string) {
  return sendError(res, 400, 'Bad Request', message)
}

/**
 * Send internal server error (500)
 */
export function sendServerError(res: NextApiResponse, message?: string) {
  return sendError(
    res,
    500,
    'Internal Server Error',
    message || 'An unexpected error occurred'
  )
}

/**
 * Validate required fields in request body
 * Returns array of missing field names
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string[] {
  const missing: string[] = []
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missing.push(field)
    }
  }
  
  return missing
}
