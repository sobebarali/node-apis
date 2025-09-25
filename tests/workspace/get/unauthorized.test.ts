import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/get.workspace';

describe('Get Workspace - Unauthorized Tests', () => {
  it('should return 401 for missing authentication token', async () => {
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(401);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('UNAUTHORIZED');
    }
  });

  it('should return 401 for invalid authentication token', async () => {
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INVALID_TOKEN');
    }
  });

  it('should return 403 for insufficient permissions', async () => {
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .set('Authorization', 'Bearer limited-permissions-token')
      .expect(403);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('INSUFFICIENT_PERMISSIONS');
    }
  });
});
