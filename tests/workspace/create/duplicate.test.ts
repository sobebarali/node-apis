import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/create.workspace';

describe('Create Workspace - Duplicate Tests', () => {
  it('should return 409 for duplicate workspace', async () => {
    const payload: typePayload = {
      // Add success payload for create workspace
    };

    // First creation should succeed
    await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(201);

    // Second creation should fail with duplicate error
    const response = await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(409);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('DUPLICATE_ENTRY');
    }
  });

  it('should handle duplicate email addresses', async () => {
    const payload: typePayload = {
      // Add success payload for create workspace
    };

    // Test duplicate email scenario
    const response = await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(409);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('DUPLICATE_EMAIL');
    }
  });
});
