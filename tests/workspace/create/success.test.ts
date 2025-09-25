import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/create.workspace';

describe('Create Workspace - Success Tests', () => {
  it('should create workspace successfully', async () => {
    const payload: typePayload = {
      // Add success payload for create workspace
    };

    const response = await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(201);

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  
  it('should create workspace with minimal payload', async () => {
    const payload: typePayload = {
      // Add minimal required fields only
    };

    const response = await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });

  it('should create workspace with complete payload', async () => {
    const payload: typePayload = {
      // Add all optional fields
    };

    const response = await request(app)
      .post('/api/workspaces')
      .send(payload)
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.error).toBeNull();
  });
});
