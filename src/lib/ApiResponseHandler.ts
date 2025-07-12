// lib/ApiResponseHandler.ts
interface ApiResponse {
  statuscode: string; // Status code (e.g., "0x00")
  status: string; // Status code (e.g., "0x00")
  message: string; // Response message
  data?: any; // Optional data payload
}

  interface ResponseHandlerResult {
    statuscode?: string
    success: boolean;
    message: string;
    data?: any;
  }
  
  export class ApiResponseHandler {
    static handleResponse(response: ApiResponse): ResponseHandlerResult {
      if (response.statuscode === "0x00") {
        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      }
      return {
        statuscode: response.statuscode,
        success: false,
        message: response.message,
      };
    }
  
    static handleError(error: any): ResponseHandlerResult {
        console.log(error)
      if (error.message) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: `An unexpected error occurred. Please try agains.`,
      };
    }
  }