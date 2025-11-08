import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('GET /api/todos/:id', () => {
  it('should retrieve an existing todo', async () => {
    const todoId = 'test-id'; // Replace with a valid ID

    const response = await request(app)
      .get(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('todoId', todoId);
  });

  it('should return not found error for non-existent todo', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app)
      .get(`/api/todos/${invalidId}`)
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
