import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.backendEndpoint;

if (!API_BASE_URL) {
    console.warn(
        "API_BASE_URL is not defined. Ensure 'backendEndpoint' is in app config's extra field."
    );
}

// Create an Axios instance with a base URL and default headers if needed
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // e.g., 10 second timeout
    // headers: { 'X-Custom-Header': 'foobar' } // Example global header
});

// --- Interfaces (can remain mostly the same as your fetch example) ---
interface LoginResponse {
    access_token: string;
    token_type: string;
}

interface UserResponse {
    id: number;
    username: string;
}

interface ApiErrorDetailItem {
    msg: string;
    type: string;
}

interface ApiErrorData { // Renamed from ApiErrorResponse to avoid conflict with AxiosError.response
    detail?: string | ApiErrorDetailItem[];
}

// Custom error class remains useful
export class ApiServiceError extends Error {
    status?: number;
    errorData?: ApiErrorData;

    constructor(message: string, status?: number, errorData?: ApiErrorData) {
        super(message);
        this.name = 'ApiServiceError';
        this.status = status;
        this.errorData = errorData;
    }
}

// --- API Service Object ---
export const apiService = {
    login: async (username_form: string, password_form: string): Promise<LoginResponse> => {
        const endpoint = `/auth/token`; // Endpoint relative to baseURL
        console.log(`[apiService] axios login: Calling ${API_BASE_URL}${endpoint}`);

        const params = new URLSearchParams();
        params.append('username', username_form);
        params.append('password', password_form);

        try {
            const response = await apiClient.post<LoginResponse>(endpoint, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log("[apiService] axios login: Success", response.data);
            return response.data; // Axios puts response data in `data`
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            console.error("[apiService] axios login: Error", axiosError.response?.data || axiosError.message);
            let errorMessage = axiosError.message || 'An unexpected error occurred during login.';
            const errorData = axiosError.response?.data;
            const status = axiosError.response?.status;

            if (errorData?.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(e => e.msg).join(', ');
                }
            }
            throw new ApiServiceError(errorMessage, status, errorData);
        }
    },

    signup: async (username_req: string, password_req: string): Promise<UserResponse> => {
        const endpoint = `/users/`;
        console.log(`[apiService] axios signup: Calling ${API_BASE_URL}${endpoint}`);

        try {
            const response = await apiClient.post<UserResponse>(endpoint, {
                username: username_req,
                password: password_req,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log("[apiService] axios signup: Success", response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            console.error("[apiService] axios signup: Error", axiosError.response?.data || axiosError.message);
            let errorMessage = axiosError.message || 'An unexpected error occurred during signup.';
            const errorData = axiosError.response?.data;
            const status = axiosError.response?.status;

            if (errorData?.detail) {
                // ... (same error detail parsing as login) ...
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(e => e.msg).join(', ');
                }
            }
            throw new ApiServiceError(errorMessage, status, errorData);
        }
    },

    getMyProfile: async (token: string): Promise<UserResponse> => {
        const endpoint = `/users/me`;
        console.log(`[apiService] axios getMyProfile: Calling ${API_BASE_URL}${endpoint}`);
        try {
            const response = await apiClient.get<UserResponse>(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log("[apiService] axios getMyProfile: Success", response.data);
            return response.data;
        } catch (error) {
            // ... (similar error handling) ...
            const axiosError = error as AxiosError<ApiErrorData>;
            console.error("[apiService] axios getMyProfile: Error", axiosError.response?.data || axiosError.message);
            let errorMessage = axiosError.message || 'Failed to fetch profile.';
            const errorData = axiosError.response?.data;
            const status = axiosError.response?.status;
            if (errorData?.detail) { /* ... */ }
            throw new ApiServiceError(errorMessage, status, errorData);
        }
    },

    // Example of using an interceptor to add auth token to requests
    // This would typically be set up once when apiClient is created or when token is available
    setupAuthInterceptor: (token: string | null) => {
        // apiClient.interceptors.request.clear(); // Clear existing interceptors if any
        apiClient.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        console.log('[apiService] Auth interceptor configured.');
    },
};

// You could call setupAuthInterceptor from your AuthProvider when the token changes.
// Example:
// In AuthProvider.tsx
// useEffect(() => {
//   apiService.setupAuthInterceptor(token);
// }, [token]);