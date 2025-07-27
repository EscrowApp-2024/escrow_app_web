// services/AuthService.ts
import apiClient from "@/lib/apiClient";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_phone: string;
  country_id: string;
}

interface VerifyEmailPayload {
  email: string;
  code: string;
}

interface LoginPayload {
  email: string;
  password: string;
  otp_method: string;
  phoneNumber?: boolean;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

interface ResendCodePayload {
  email: string;
  code_type: string;
}

interface ValidateLoginPayload {
  email: string;
  code: string;
}

interface changemobileNumber {
  mobile_number: string | null;
}

export class AuthService {
    // Define which routes are protected
    private static protectedRoutes: Set<string> = new Set([
      "/v1/auth/validate-login", // Protected: Requires session key, auth token, and signature
      "/v1/auth/resend-code", // Protected: Requires session key and signature
      "/v1/auth/resend-login-code", // Protected: Requires session key and signature
    ]);
  

    // Helper method to make API calls with proper configuration
    private static async makeRequest<T>(
      method: "get" | "post" | "put" | "patch" | "delete",
      url: string,
      data?: any,
      isProtected: boolean = false,
      customHeaders: Record<string, string> = {} // Add customHeaders parameter
    ): Promise<any> {
      try {
        const config = {
          method,
          url,
          data,
          isProtected, // Pass the isProtected flag
          headers: customHeaders, // Pass custom headers
        };
  
        const response = await apiClient.request(config);
        return ApiResponseHandler.handleResponse(response.data);
      } catch (error) {
        return ApiResponseHandler.handleError(error);
      }
    }

    static async register(payload: RegisterPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/createAccount", payload, false, customHeaders); // Public route
    }
   
    static async verifyEmail(payload: VerifyEmailPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/verify-account", payload, false, customHeaders); // Public route
    }
  
    static async login(payload: LoginPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/login", payload, false, customHeaders); // Public route
    }
  
    static async forgotPassword(payload: ForgotPasswordPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/forgot-password", payload, false, customHeaders); // Public route
    }
  
    static async resetPassword(payload: ResetPasswordPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/reset-password", payload, false, customHeaders); // Public route
    }
  
    static async resendCode({ email, code_type }: ResendCodePayload, customHeaders: Record<string, string> = {}) {
      const url = `/v1/auth/resend-code?email=${email}&code_type=${code_type}`;
      return this.makeRequest("get", url, undefined, true, customHeaders); // Protected route
    }

    static async validateLogin(payload: ValidateLoginPayload, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("post", "/v1/auth/validate-login", payload, false, customHeaders); // Protected route
    }

    static async changeMobileNumber(payload: changemobileNumber, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("patch", "/v1/auth/change-mobile-number", payload, true, customHeaders); // Protected route
    }
    
    static async validateMobileChange(payload: changemobileNumber, customHeaders: Record<string, string> = {}) {
      return this.makeRequest("patch", "/v1/auth/change-mobile-number/validate", payload, true, customHeaders); // Protected route
    }
}
