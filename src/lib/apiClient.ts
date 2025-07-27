// lib/apiClient.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";
import Cookies from "js-cookie";
//import { redirectToLoginClient } from "@/lib/SessionManager";
//import { store } from "@/store/store"; // Import your Redux store

// Extend the Axios request config
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isProtected?: boolean;
  method?: string;
  url?: string;
  headers: AxiosRequestHeaders;
}

/*
// Implement signData function using Web Crypto API
async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const signature = await window.crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: { name: "SHA-256" },
      },
      privateKey,
      encodedData
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  } catch (error) {
    throw new Error("Failed to sign data: " + error);
  }
}*/

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    const headers: Record<string, string> = {
      ...config.headers,
    };
    
    console.log(`Done crypto`)
    if (config.isProtected) {
      // Get session key from cookies
      /*
      const sessionKey = Cookies.get("x-escrow_api-session_key") || null;
      if (sessionKey) {
        headers["x-escrow_api-session_key"] = sessionKey;
      }*/

      // Get auth token from cookies
      const authToken = Cookies.get("accessToken") || null;
      if (authToken) {
        headers["x-auth-token"] = authToken;
      }

      // Get private key from Redux state
      
      //const privateKey = store.getState().auth.privateKey; // Access Redux state directly

      // Generate signature if privateKey, method, and url are available
      /*
      if (privateKey && config.method && config.url) {
        const dataToSign = `${config.method.toUpperCase()} ${config.url}`;
        try {
          const signature = await signData(dataToSign, privateKey);
          headers["x-escrow_app-signature"] = signature;
        } catch (error) {
          console.error("Failed to sign data for x-escrow_app-signature:", error);
          // Optionally reject the request here if signature is critical
          // return Promise.reject(error);
        }
      } else {
        console.warn("Cannot generate x-escrow_app-signature: method, url, or privateKey is missing.");
      }*/
    }

    config.headers = {
      ...headers,
    } as AxiosRequestHeaders;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response) {
      console.log(error);
      return Promise.reject({ message: "Network error. Please try again." });
    }
    // If 401/403 or other auth errors, redirect to login
    if (error.response.status === 401 || error.response.status === 403) {
      console.log("redirect to login")
    }
    return Promise.reject(error.response.data);
  }
);

export default apiClient;