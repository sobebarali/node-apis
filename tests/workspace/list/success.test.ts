import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../../src/app';
import type { typePayload, typeResult, typeResultData, typeResultError } from '../../../src/apis/workspace/types/list.workspace';

describe('List Workspace - Success Tests', () => {
  it('should list workspace successfully', async () => {
    const payload: typePayload = {
      // Add success payload for list workspace
    };

    const response = await request(app)
      .get('/api/workspaces')
      
      .expect(200);

    const result: typeResult = response.body;
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
    
    if (result.data) {
      const data: typeResultData = result.data;
      expect(data).toHaveProperty('id');
    }
  });

  
  it('should list workspaces with pagination', async () => {
    const response = await request(app)
      .get('/api/workspaces?page=1&limit=10')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.error).toBeNull();
  });

  it('should list workspaces with filters', async () => {
    const response = await request(app)
      .get('/api/workspaces?filter=active')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.error).toBeNull();
  });
});
