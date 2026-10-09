// Set at build time (see Dockerfile). The defaults are for running locally
// next to the API (port 3000) and the app (port 5173).
export const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const APP_URL: string = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
