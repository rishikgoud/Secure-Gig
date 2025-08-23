import request from 'supertest';
import express from 'express';
import { chain } from '../../src/routes/chain';

const app = express();
app.use(express.json());
app.use('/api/chain', chain);

describe('Chain Routes', () => {
  describe('GET /api/chain/gas', () => {
    it('should return gas suggestion', async () => {
      const response = await request(app)
        .get('/api/chain/gas')
        .expect(200);

      expect(response.body).toHaveProperty('chainId');
      expect(response.body).toHaveProperty('baseFeePerGas');
      expect(response.body).toHaveProperty('maxPriorityFeePerGas');
      expect(response.body).toHaveProperty('maxFeePerGas');
      expect(response.body).toHaveProperty('human');
    }, 10000);
  });

  describe('GET /api/chain/info', () => {
    it('should return chain information', async () => {
      const response = await request(app)
        .get('/api/chain/info')
        .expect(200);

      expect(response.body).toHaveProperty('chainId');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('blockNumber');
      expect(response.body.name).toBe('Avalanche Fuji (C-Chain)');
    }, 10000);
  });
});
