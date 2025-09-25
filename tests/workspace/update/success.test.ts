import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/update.workspace';

describe('Update Workspace - Success Tests', () => {
  it('should update workspace successfully', async () => {
    const payload: typePayload = {
      // Add success payload for update workspace
    };

    const response = await request(app)
      .put('/api/workspaces/test-id')
      .send(payload)
      .expect(200);

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  
  it('should update existing workspace', async () => {
    const workspaceId = 'existing-workspace-id';
    const payload: typePayload = {
      id: workspaceId,
      // Add update fields
    };

    const response = await request(app)
      .put(`/api/workspaces/${workspaceId}`)
      .send(payload)
      .expect(200);

    expect(response.body.data.id).toBe(workspaceId);
    expect(response.body.error).toBeNull();
  });
});
