import { Router } from "express";
import { getGasSuggestion } from "../services/gasService";
import { provider } from "../config/provider";
import { logger } from "../config/logger";

export const chain = Router();

chain.get("/gas", async (_req, res, next) => {
  try {
    const gasSuggestion = await getGasSuggestion();
    res.json(gasSuggestion);
  } catch (error) {
    logger.error('Error getting gas suggestion:', error);
    next(error);
  }
});

chain.get("/info", async (_req, res, next) => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    res.json({ 
      chainId: Number(network.chainId), 
      name: "Avalanche Fuji (C-Chain)",
      blockNumber
    });
  } catch (error) {
    logger.error('Error getting chain info:', error);
    next(error);
  }
});
