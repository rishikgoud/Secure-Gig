import axios from "axios";
import { env } from "./env";
import { logger } from "./logger";

export const glacier = axios.create({
  baseURL: `${env.GLACIER_BASE}/v1`,
  headers: { 
    "x-glacier-api-key": env.GLACIER_API_KEY,
    "Content-Type": "application/json"
  },
  timeout: 30000
});

// Add request/response interceptors for logging
glacier.interceptors.request.use(
  (config) => {
    logger.debug(`Glacier API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Glacier API Request Error:', error);
    return Promise.reject(error);
  }
);

glacier.interceptors.response.use(
  (response) => {
    logger.debug(`Glacier API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('Glacier API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);
