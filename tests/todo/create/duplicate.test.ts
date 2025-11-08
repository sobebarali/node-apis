import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Duplicate tests for create todo', () => {
  it('should handle duplicate todo error', async () => {
    // Test for duplicate data case (only applicable for create)
    const duplicateTodo = {
      name: 'Test Todo',
      // Add fields that would cause a duplicate error
    };

    const response = await request(app)
      .post('/api/todos')
      .send(duplicateTodo)
      .expect(409); // Conflict status for duplicate

    expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
  });
});
