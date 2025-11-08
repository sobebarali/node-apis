import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('PUT /api/todos/:id', () => {
  it('should update an existing todo', async () => {
    const todoId = 'test-id'; // Replace with a valid ID
    const updateData = {
      name: 'Updated Todo',
      description: 'Updated description',
    };

    const response = await request(app)
      .put(`/api/todos/${todoId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.data.name).toBe(updateData.name);
  });

  it('should return validation error for invalid input', async () => {
    const invalidId = 'invalid-id';
    const updateData = {
      name: '', // Invalid: empty name
    };

    const response = await request(app)
      .put(`/api/todos/${invalidId}`)
      .send(updateData)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
