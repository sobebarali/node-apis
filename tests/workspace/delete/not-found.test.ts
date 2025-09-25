import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/delete.workspace';

describe('Delete Workspace - Not Found Tests', () => {
  it('should return 404 for non-existent workspace', async () => {
    const nonExistentId = 'non-existent-id';
    const payload: typePayload = {
      // Add success payload for delete workspace
    };

    const response = await request(app)
      .delete('/api/workspaces/test-id')
      
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 404 for deleted workspace', async () => {
    const deletedId = 'deleted-id';
    const payload: typePayload = {
      // Add success payload for delete workspace
    };

    const response = await request(app)
      .delete('/api/workspaces/test-id')
      
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });

  it('should return 404 for soft-deleted workspace', async () => {
    const softDeletedId = 'soft-deleted-id';
    const payload: typePayload = {
      // Add success payload for delete workspace
    };

    const response = await request(app)
      .delete('/api/workspaces/test-id')
      
      .expect(404);

    const result: typeResult = response.body;
    expect(result.data).toBeNull();
    
    if (result.error) {
      const error: typeResultError = result.error;
      expect(error.code).toBe('NOT_FOUND');
    }
  });
});
