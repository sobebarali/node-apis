import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Unauthorized tests for delete todo', () => {
  it('should return unauthorized error when no auth provided', async () => {
    const response = await request(app)
      .delete('/api/todos')
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
