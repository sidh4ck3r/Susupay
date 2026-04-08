export const API_BASE_URL = typeof window !== 'undefined' 
  ? `http://${window.location.hostname}:5050` 
  : 'http://localhost:5050';
