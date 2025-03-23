// lib/apiClient.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import Cookies from "js-cookie";
import ApiKeyGenerator from "@/lib/api_authKey_generator";

// Extend the Axios request config to include a flag for protected routes and custom headers
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isProtected?: boolean;
  method?: string; // Make method optional to match InternalAxiosRequestConfig
  url?: string; // Make url optional to match InternalAxiosRequestConfig
  headers: AxiosRequestHeaders; // Headers are non-optional as fixed previously
}

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api", // Proxy endpoint to mask real backend URLs
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Instantiate ApiKeyGenerator for signing data
const authKeyGenerator = new ApiKeyGenerator();

// Request Interceptor: Add headers for protected routes
apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    // Start with any custom headers provided by the caller
    const headers: Record<string, string> = {
      ...config.headers, // Merge custom headers from the config
    };

    // If the route is protected, add the authentication headers
    if (config.isProtected) {
      // Get the session key from cookies
      const sessionKey = Cookies.get("x-escrow_api-session_key") || null;
      const privateKey = Cookies.get("x-escrow_api-key") || null; // From the key pair generated during login
      console.log(sessionKey, privateKey)

      // Add x-escrow_api-session_key if available
      if (sessionKey) {
        headers["x-escrow_api-session_key"] = sessionKey;
      }

      // Add x-auth-token if available
      const authToken = Cookies.get("accessToken") || null;
      if (authToken) {
        headers["x-auth-token"] = authToken;
      }

      // Generate the x-escrow_app-signature if privateKey, method, and url are available
      if (privateKey && config.method && config.url) {
        const dataToSign = `${config.method.toUpperCase()} ${config.url}`;
        try {
          const signature = await authKeyGenerator.signData(dataToSign, privateKey);
          headers["x-escrow_app-signature"] = signature;
        } catch (error) {
          console.error("Failed to sign data for x-escrow_app-signature:", error);
        }
      } else {
        console.warn("Cannot generate x-escrow_app-signature: method, url, or privateKey is missing.");
      }
    }

    // Merge the headers into the config
    config.headers = {
      ...headers,
    } as AxiosRequestHeaders;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global error responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle global errors (e.g., network issues, 500 errors)
    if (!error.response) {
      console.log(error);
      return Promise.reject({ message: "Network error. Please try again." });
    }
    return Promise.reject(error.response.data);
  }
);

export default apiClient;