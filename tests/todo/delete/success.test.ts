import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('DELETE /api/todos/:id', () => {
  it('should delete an existing todo', async () => {
    const todoId = 'test-id'; // Replace with a valid ID

    const response = await request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('deleted_at');
  });

  it('should return not found error for non-existent todo', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app)
      .delete(`/api/todos/${invalidId}`)
      .expect(404);

    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
