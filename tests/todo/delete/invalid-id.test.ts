import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Invalid ID tests for delete todo', () => {
  it('should return error for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';

    const response = await request(app)
      .delete('/api/todos/${invalidId}')
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
