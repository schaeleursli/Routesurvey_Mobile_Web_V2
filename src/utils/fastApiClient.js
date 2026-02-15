/**
 * FastAPI Backend Client
 * 
 * Axios client for communicating with the FastAPI backend.
 * Handles authentication, error responses, and request/response formatting.
 */

import axios from 'axios';

// Get FastAPI base URL from environment
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8002';

// Create axios instance
const fastApiClient = axios.create({
    baseURL: FASTAPI_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - add authentication token
fastApiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage (assuming same auth as Node backend)
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (import.meta.env.DEV) {
            console.log(`[FastAPI] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('[FastAPI] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
fastApiClient.interceptors.response.use(
    (response) => {
        // Log responses in development
        if (import.meta.env.DEV) {
            console.log(`[FastAPI] Response from ${response.config.url}:`, response.status);
        }
        return response;
    },
    (error) => {
        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            // Log error details in development
            if (import.meta.env.DEV) {
                console.error(`[FastAPI] Error ${status}:`, data);
            }

            // Handle common HTTP errors
            switch (status) {
                case 401:
                    console.error('[FastAPI] Unauthorized - token may be invalid');
                    // Could trigger logout here if needed
                    break;
                case 403:
                    console.error('[FastAPI] Forbidden - insufficient permissions');
                    break;
                case 404:
                    console.error('[FastAPI] Not found:', error.config?.url);
                    break;
                case 422:
                    console.error('[FastAPI] Validation error:', data.detail);
                    break;
                case 500:
                    console.error('[FastAPI] Server error');
                    break;
            }
        } else if (error.request) {
            console.error('[FastAPI] No response received - backend may be down');
        } else {
            console.error('[FastAPI] Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

/**
 * Helper function to check if FastAPI backend is available
 */
export async function checkFastApiHealth() {
    try {
        const response = await fastApiClient.get('/health');
        return {
            available: true,
            ...response.data,
        };
    } catch (error) {
        return {
            available: false,
            error: error.message,
        };
    }
}

/**
 * Get FastAPI base URL (useful for debugging)
 */
export function getFastApiBaseUrl() {
    return FASTAPI_BASE_URL;
}

export default fastApiClient;
