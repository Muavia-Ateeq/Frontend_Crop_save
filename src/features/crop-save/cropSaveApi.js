import axios from 'axios';

const baseURL = (import.meta.env.VITE_CROPSAVE_API_URL || 'http://localhost:8001')
  .replace(/\/+$/, '');

export const cropSaveApi = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
