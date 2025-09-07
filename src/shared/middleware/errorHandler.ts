/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
} from '../errors';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle specific error types
  if (error instanceof ValidationError) {
    res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        statusCode: 400,
        ...(error.field && { field: error.field }),
      },
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: error.message,
        statusCode: 404,
      },
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    res.status(401).json({
      data: null,
      error: {
        code: 'UNAUTHORIZED',
        message: error.message,
        statusCode: 401,
      },
    });
    return;
  }

  if (error instanceof AuthorizationError) {
    res.status(403).json({
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: error.message,
        statusCode: 403,
      },
    });
    return;
  }

  if (error instanceof BusinessLogicError) {
    res.status(422).json({
      data: null,
      error: {
        code: 'BUSINESS_LOGIC_ERROR',
        message: error.message,
        statusCode: 422,
      },
    });
    return;
  }

  if (error instanceof DatabaseError) {
    res.status(500).json({
      data: null,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        statusCode: 500,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      statusCode: 500,
    },
  });
};
