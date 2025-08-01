// services/AuthService.ts
import apiClient from "@/lib/apiClient";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";

interface FundWalletPayload {
    amount: number; // The amount to fund the wallet, must be >= 0.01
    currency: string; // The currency of the transaction (e.g., NGN, USD)
    channel: "bank_transfer" | "card" | "pay_with_bank"; // The payment channel, restricted to specific values
}

interface VerifyBankPayload {
    account_number: string; // Unique bank account number
    bank_code: string; // Unique identifier for the bank (SWIFT, BIC, or other identifier) 
}

interface AddBankPayload {
    bank_name: string;
    account_number: string;
    bank_code: string;
    is_default?: boolean;
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
  
    static async fundWallet(payload: FundWalletPayload, walletId: string, customHeaders: Record<string, string> = {},) {
        const url = `/v1/wallet/fundWallet/${walletId}`;
        return this.makeRequest("post", url, payload, true, customHeaders); // Protected route, corrected method to POST and added URL
    }

    static async getWalletBalances(walletId: string, customHeaders: Record<string, string> = {}) {
      const url = `/v1/wallet/getWalletBalances/${walletId}`;
      return this.makeRequest("get", url, undefined, true, customHeaders); // Protected route, corrected method to POST and added URL
   }

   static async walletRecentTransactions(walletId: string, customHeaders: Record<string, string> = {}) {
     const url = `/v1/wallet/walletTransactions/${walletId}?get=recent`;
     return this.makeRequest("get", url, undefined, true, customHeaders); // Protected route, corrected method to POST and added URL
   }

   static async fundWalletProcessing(walletId: string, reference: string, customHeaders: Record<string, string> = {}) {
    const url = `v1/wallet/fundWallet/processing/${walletId}/${reference}`;
    return this.makeRequest("patch", url, undefined, true, customHeaders); // Protected route, corrected method to POST and added URL
   }

   static async getAllBanks(customHeaders: Record<string, string> = {}) {
    const url = `v1/wallet/get-all-banks`;
    return this.makeRequest("get", url, undefined, true, customHeaders); // Protected route, corrected method to POST and added URL
   }

   static async verifyBankDetails(payload: VerifyBankPayload, customHeaders: Record<string, string> = {}) {
    const url = `v1/wallet/verify-bank-details`;
    return this.makeRequest("post", url, payload, true, customHeaders); // Protected route, corrected method to POST and added URL
   }

   static async addBankDetails(payload: AddBankPayload, walletId: string, customHeaders: Record<string, string> = {}) {
    const url = `v1/wallet/add-bank-details/${walletId}`;
    return this.makeRequest("post", url, payload, true, customHeaders); // Protected route, corrected method to POST and added URL
   }
}