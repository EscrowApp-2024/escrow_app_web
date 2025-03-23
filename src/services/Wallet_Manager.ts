// services/AuthService.ts
import apiClient from "@/lib/apiClient";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";

interface FundWalletPayload {
    amount: number; // The amount to fund the wallet, must be >= 0.01
    currency: string; // The currency of the transaction (e.g., NGN, USD)
    channel: "card" | "bank_transfer" | "pay_with_bank"; // The payment channel, restricted to specific values
}


export class WalletManagerService {

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
  
    static async fundWallet(payload: FundWalletPayload, customHeaders: Record<string, string> = {}, walletId: string) {
        const url = `/v1/fundWallet/:${walletId}`;
        return this.makeRequest("post", url, payload, true, customHeaders); // Protected route, corrected method to POST and added URL
    }
    
}
