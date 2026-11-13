import axios from 'axios';

export const COTTON_YIELD_API_URL = import.meta.env.VITE_COTTON_YIELD_API_URL
  || import.meta.env.VITE_API_URL
  || 'http://localhost:8000';

export const cottonYieldApi = axios.create({
  baseURL: COTTON_YIELD_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});
