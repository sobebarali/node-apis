import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Not found tests for get todo', () => {
  it('should return not found error for non-existent todo', async () => {
    const invalidId = 'non-existent-id';

    const response = await request(app)
      .get('/api/todos/${invalidId}')
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
