import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/delete.workspace';

describe('Delete Workspace - Success Tests', () => {
  it('should delete workspace successfully', async () => {
    const payload: typePayload = {
      // Add success payload for delete workspace
    };

    const response = await request(app)
      .delete('/api/workspaces/test-id')
      
      .expect(200);

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  
  it('should delete existing workspace', async () => {
    const workspaceId = 'existing-workspace-id';

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}`)
      .expect(200);

    expect(response.body.data.deleted_id).toBe(workspaceId);
    expect(response.body.error).toBeNull();
  });
});
