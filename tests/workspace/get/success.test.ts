import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/get.workspace';

describe('Get Workspace - Success Tests', () => {
  it('should get workspace successfully', async () => {
    const payload: typePayload = {
      // Add success payload for get workspace
    };

    const response = await request(app)
      .get('/api/workspaces/test-id')
      
      .expect(200);

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  
  it('should get existing workspace', async () => {
    const workspaceId = 'existing-workspace-id';

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .expect(200);

    expect(response.body.data.id).toBe(workspaceId);
    expect(response.body.error).toBeNull();
  });
});
