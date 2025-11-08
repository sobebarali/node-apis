import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('GET /api/todos', () => {
  it('should retrieve a list of todos', async () => {
    const response = await request(app)
      .get('/api/todos')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body.data).toHaveProperty('items');
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data).toHaveProperty('_metadata');
  });

  it('should handle query parameters correctly', async () => {
    const response = await request(app)
      .get('/api/todos')
      .query({ search: 'test', status: 'active' })
      .expect(200);

    expect(response.body.data).toHaveProperty('items');
  });
});
