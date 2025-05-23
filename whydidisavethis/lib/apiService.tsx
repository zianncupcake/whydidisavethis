import { User } from '@/utils/authContext';
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

// interface UserResponse {
//     id: number;
//     username: string;
// }
export interface ItemCreatePayload {
    user_id: number;
    source_url?: string;
    notes?: string;
    categories?: string[];
    tags?: string[];
    creator?: string;
    image_url?: string;
}
export interface Item {
    id: number;
    user_id: number;
    source_url?: string | null;
    notes?: string | null;
    categories: string[];
    tags: string[];
    creator?: string | null;
    image_url?: string | null;
}

interface ApiErrorDetailItem {
    msg: string;
    type: string;
}

interface ApiErrorData {
    detail?: string | ApiErrorDetailItem[];
}

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
            return response.data;
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

    signup: async (username_req: string, password_req: string): Promise<User> => {
        const endpoint = `/users/`;
        console.log(`[apiService] axios signup: Calling ${API_BASE_URL}${endpoint}`);

        try {
            const response = await apiClient.post<User>(endpoint, {
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

    deleteUser: async (user_id: number): Promise<void> => {
        const endpoint = `/users/${user_id}`;
        console.log(`[apiService] axios delete user: Calling ${API_BASE_URL}${endpoint}`);

        try {
            await apiClient.delete(endpoint)
            // console.log("[apiService] axios delete user: Success", response.data);
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            console.error("[apiService] axios delete user: Error", axiosError.response?.data || axiosError.message);
            let errorMessage = axiosError.message || 'An unexpected error occurred during delete user.';
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

    getUserFromToken: async (token: string): Promise<User> => {
        const endpoint = `/users/me`;
        console.log(`[apiService] axios getMyProfile: Calling ${API_BASE_URL}${endpoint}`);
        try {
            const response = await apiClient.get<User>(endpoint, {
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

    addItem: async (itemData: ItemCreatePayload): Promise<Item> => {
        const endpoint = `/items/`;
        console.log(`[apiService] axios addItem: Calling ${API_BASE_URL}${endpoint}`);

        try {
            const response = await apiClient.post<Item>(endpoint, itemData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log("[apiService] axios addItem: Success", response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            const errorResponseData = axiosError.response?.data;
            const status = axiosError.response?.status;
            let errorMessage = axiosError.message || 'An unexpected error occurred while adding the item.';

            console.error("[apiService] axios addItem: Error", errorResponseData || axiosError.message);

            if (errorResponseData?.detail) {
                if (typeof errorResponseData.detail === 'string') {
                    errorMessage = errorResponseData.detail;
                } else if (Array.isArray(errorResponseData.detail)) {
                    errorMessage = errorResponseData.detail.map(e => e.msg).join(', ');
                }
            }
            throw new ApiServiceError(errorMessage, status, errorResponseData);
        }
    },

    fetchUserItems: async (userId: number): Promise<Item[]> => {
        // Adjust endpoint to your actual API endpoint for fetching items
        const endpoint = `/users/${userId}/items`; // Example endpoint
        try {
            const response = await apiClient.get<Item[]>(endpoint); // Expects an array of Item
            // console.log("[apiService] axios fetchUserItems: Success", response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            const errorResponseData = axiosError.response?.data;
            const status = axiosError.response?.status;
            let errorMessage = axiosError.message || 'An unexpected error occurred while fetching items.';
            console.error("[apiService] axios fetchUserItems: Error", errorResponseData || axiosError.message);
            if (errorResponseData?.detail) {
                if (typeof errorResponseData.detail === 'string') {
                    errorMessage = errorResponseData.detail;
                } else if (Array.isArray(errorResponseData.detail) && errorResponseData.detail.length > 0) {
                    errorMessage = errorResponseData.detail.map(e => e.msg || String(e)).join(', ');
                }
            }
            throw new ApiServiceError(errorMessage, status, errorResponseData);
        }
    },

    fetchItem: async (itemId: number): Promise<Item> => {
        const endpoint = `/items/${itemId}`;
        console.log(`[apiService] axios getItemById: Calling ${API_BASE_URL}${endpoint}`);
        try {
            const response = await apiClient.get<Item>(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log("[apiService] axios getItemById: Success", response.data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorData>;
            const errorResponseData = axiosError.response?.data;
            const status = axiosError.response?.status;
            let errorMessage = axiosError.message || `Failed to fetch item with ID ${itemId}.`;
            console.error("[apiService] axios getItemById: Error", errorResponseData || axiosError.message);

            if (status === 404) {
                errorMessage = "Item not found.";
            } else if (errorResponseData?.detail) {
                if (typeof errorResponseData.detail === 'string') {
                    errorMessage = errorResponseData.detail;
                } else if (Array.isArray(errorResponseData.detail) && errorResponseData.detail.length > 0) {
                    errorMessage = errorResponseData.detail.map(e => e.msg || String(e)).join(', ');
                }
            }
            throw new ApiServiceError(errorMessage, status, errorResponseData);
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