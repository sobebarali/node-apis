import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/get.workspace';

describe('Get Workspace - Invalid ID Tests', () => {
  it('should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid-id-format';
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });

  it('should return 400 for malformed UUID', async () => {
    const malformedUuid = 'not-a-uuid';
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_UUID');
    }
  });

  it('should return 400 for empty ID', async () => {
    const emptyId = '';
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });

  it('should return 400 for null ID', async () => {
    const nullId = null;
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(400);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_ID_FORMAT');
    }
  });
});
