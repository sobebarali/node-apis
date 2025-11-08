import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../../app'; // Adjust path to your express app

describe('Validation tests for create todo', () => {
  it('should return validation error for invalid input', async () => {
    const invalidPayload = {}; // Provide an invalid payload for create
    
    let endpoint = '';
    switch('create') {
      case 'create':
        endpoint = '/api/todos';
        break;
      case 'get':
        endpoint = '/api/todos/invalid-id';
        break;
      case 'update':
        endpoint = '/api/todos/invalid-id';
        break;
      case 'delete':
        endpoint = '/api/todos/invalid-id';
        break;
      case 'list':
        endpoint = '/api/todos';
        break;
      default:
        endpoint = '/api/todos';
    }

    const response = await request(app)
      .post(endpoint)
      .send(invalidPayload)
      .expect(400);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
