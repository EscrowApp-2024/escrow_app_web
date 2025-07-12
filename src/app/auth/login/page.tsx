"use client";

import { useState, useEffect, useCallback, useMemo, SetStateAction } from "react";
import { MdArrowBack } from "react-icons/md";
import InputField from "@/components/UI/InputField";
import { Message, Email } from "@mui/icons-material";
import Link from "next/link";
import Header from "@/components/UI/header";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setEmail, setPhoneNumber, setFromPage } from "@/store/authSlice";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const [showValidationOptions, setShowValidationOptions] = useState(false);
  const [otpMethod, setOtpMethod] = useState<string | null>(null); // Still needed locally

  const dispatch = useDispatch();
  const router = useRouter();

  const validateForm = useCallback(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isStrongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      );

    return {
      email: !isValidEmail && formData.email ? "Invalid email address" : "",
      password: !isStrongPassword && formData.password
        ? "Password must be 8+ characters with upper, lower, number, and special char"
        : "",
    };
  }, [formData]);

  const validationResult = useMemo(() => validateForm(), [validateForm]);

  useEffect(() => {
    setErrors(validateForm());
  }, [formData, validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    return (
      !validationResult.email &&
      !validationResult.password &&
      formData.email &&
      formData.password
    );
  }, [formData, validationResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    if (!showValidationOptions) {
      setShowValidationOptions(true);
      return;
    }

    if (!otpMethod) {
      setResponseMessage({
        success: false,
        message: "Please select an OTP method (Email or SMS).",
      });
      setTimeout(() => setResponseMessage(null), 5000);
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);
  };

  const handleSelectOtpMethod = async (method: string) => {
    setOtpMethod(method); // Set the selected OTP method
    setIsLoading(true); // Show loading state
  
    try {
      // Prepare the payload for the backend request
      const payload = {
        email: formData.email,
        password: formData.password,
        otp_method: method,
      };
  
      // Send the request to the backend
      const result = await AuthService.login(payload);
      console.log(result)
  
      setIsLoading(false); // Hide loading state
  
      if (result.success) {
        const { email, phone } = result.data;
  
        // Dispatch to Redux state
        dispatch(setEmail(email));
        dispatch(setPhoneNumber(phone));
        dispatch(setFromPage("login"));

        setResponseMessage({ success: true, message: result.message })
        
        setTimeout(() => {
          // Pass otpMethod via URL query parameter
          router.push(`/auth/validate-login?otpMethod=${otpMethod}`);
        }, 3000);
      } else {
        if(result.statuscode === "0x508") {
          try{
            const query_params = { email: formData.email, code_type: "verifyEmail" };
            const result = await AuthService.resendCode(query_params);

           if(result.success) {
             // Set email and source in Redux store
             dispatch(setEmail(formData.email));
             dispatch(setFromPage("login"));

             setResponseMessage({ success: false, message: result.message });
             setResponseMessage(null)
             router.push(`/auth/verifyEmail?email=${encodeURIComponent(formData.email)}`)
           }
          } catch (error: any) {
            setIsLoading(false);
            const errorResult = ApiResponseHandler.handleError(error);
            setResponseMessage({ ...errorResult, isNetworkError: !error.response });
          }
        }
        setResponseMessage({ success: false, message: result.message });
      }
    } catch (error: any) {
      setIsLoading(false); // Hide loading state
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response });
      setTimeout(() => setResponseMessage(null), 5000);
    }
  };

  return (
    <div className="p-4" style={{ paddingTop: "90px", minHeight: "100vh" }}>
      <Header />
      {responseMessage && (
        <ApiResponseMessage
          success={responseMessage.success}
          message={responseMessage.message}
          onClose={() => setResponseMessage(null)}
          isNetworkError={responseMessage.isNetworkError}
        />
      )}

      {showValidationOptions ? (
        // Render the ValidationOptions box
        <div className="form-card bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Validate this Sign In
          </h2>
          <p className="text-gray-600 mb-6">
            Sign in securely with one of the options below.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => handleSelectOtpMethod("sms")}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
            >
              <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                <Message className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-White-800 dark:text-White-300 font-semibold">With Code</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                Receive a code via SMS or WhatsApp.
                </p>
              </div>
              </div>
              <span className="text-purple-800 dark:text-purple-300">›</span>
            </button>
            <button
              onClick={() => handleSelectOtpMethod("email")}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
            >
              <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                <Email className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white-800 dark:text-White-300 font-semibold">With Email</h3>
                <p className="text-White-500 dark:text-white-400 text-sm">
                We’ll send a code to your email address.
                </p>
              </div>
              </div>
              <span className="text-purple-800 dark:text-purple-300">›</span>
            </button>
          </div>
          <button
            onClick={() => setShowValidationOptions(false)}
            className="mt-6 w-full py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-800 dark:text-gray-100"
            style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        // Render the Login form
        <div className="form-card bg-white p-6 rounded-lg shadow-md w-full">
          <h1 className="text-2xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-600 mb-6">Please fill in your details to login</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={validationResult.email}
              required
            />

            <InputField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              error={validationResult.password}
              required
            />

            <button
              type="submit"
              className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
                !isFormValid || isLoading
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-button-hover"
              }`}
              style={{
                backgroundColor: "var(--primary-dark-green)",
                color: "var(--secondary-white)",
              }}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : null}
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center space-y-2">
              <Link href="/auth/register" className="text-black-500  hover:underline dark:text-black">
                Don't have an account? Register!
              </Link>
              <br />
              <Link href="/auth/forgot-password" className="text-blue-500 hover:underline">
                Forgot Password? Tap Here!
              </Link>
            </div>
          </form>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 600px) {
          .form-card {
            min-height: 0 !important;
          }
          div {
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
