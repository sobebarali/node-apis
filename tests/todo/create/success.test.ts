import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('POST /api/todos', () => {
  it('should create a new todo', async () => {
    const newTodo = {
      name: 'Test Todo',
      description: 'Test description',
    };

    const response = await request(app)
      .post('/api/todos')
      .send(newTodo)
      .expect(201);

    expect(response.body.data).toHaveProperty('todoId');
    expect(response.body.data.name).toBe(newTodo.name);
  });

  it('should return validation error for invalid input', async () => {
    const invalidTodo = {
      name: '', // Invalid: empty name
    };

    const response = await request(app)
      .post('/api/todos')
      .send(invalidTodo)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
