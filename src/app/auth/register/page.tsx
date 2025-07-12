"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MdArrowBack } from "react-icons/md";
import InputField from "@/components/UI/InputField";
import PhoneInput from "@/components/UI/PhoneInput";
import { BsEye, BsEyeSlash } from "react-icons/bs"; // Eye icons for show/hide
import Header from "@/components/UI/header";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager"; // Adjust path based on your project structure
import { ApiResponseHandler } from "@/lib/ApiResponseHandler"; // Import ApiResponseHandler for error handling
import { useRouter } from "next/navigation"; // Import useRouter for client-side routing
import { useDispatch } from "react-redux";
import { setEmail, setFromPage } from "@/store/authSlice";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    countryId: "NG",
  });
  const [showFields, setShowFields] = useState({
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isChecked, setIsChecked] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{ success: boolean; message: string; isNetworkError?: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Initialize router for navigation
  const dispatch = useDispatch(); // Access dispatch to update Redux store

  const validateForm = useCallback(() => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isStrongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password);
    const isConfirmed = formData.password === formData.confirmPassword;

    return {
      email: !isValidEmail && formData.email ? "Invalid email address" : "",
      phone: formData.phone.length <= (formData.countryId === "NG" ? 4 : 2) ? "Phone number is required" : "",
      password: !isStrongPassword && formData.password
        ? "Password must be 8+ characters with upper, lower, number, and special char"
        : "",
      confirmPassword: !isConfirmed && formData.confirmPassword ? "Passwords do not match" : "",
    };
  }, [formData]);

  const validationResult = useMemo(() => validateForm(), [validateForm]);

  useEffect(() => {
    setErrors(validateForm());
  }, [formData, validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "lastName" && value && !showFields.email) {
      setShowFields((prev) => ({ ...prev, email: true }));
    } else if (name === "email" && value && !showFields.phone) {
      setShowFields((prev) => ({ ...prev, phone: true }));
    } else if (name === "password" && value && !showFields.confirmPassword) {
      setShowFields((prev) => ({ ...prev, confirmPassword: true }));
    }
  };

  const handlePhoneChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, phone: value }));
      if (value && value.length > 4 && !showFields.password) {
        setShowFields((prev) => ({ ...prev, password: true }));
      }
    },
    [showFields.password]
  );

  const handleCountryChange = useCallback((countryId: string) => {
    setFormData((prev) => ({ ...prev, countryId }));
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const isFormValid = useMemo(() => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.countryId &&
      !validationResult.email &&
      !validationResult.phone &&
      !validationResult.password &&
      !validationResult.confirmPassword &&
      formData.confirmPassword &&
      isChecked
    );
  }, [formData, validationResult, isChecked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setResponseMessage(null);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      mobile_phone: formData.phone,
      country_id: formData.countryId,
    };

    try {
      const result = await AuthService.register(payload);
      setIsLoading(false);
      setResponseMessage(result); // Directly use the ResponseHandlerResult

      // Reset form and redirect on success
      if (result.success) {
        // Set email and source in Redux store
        dispatch(setEmail(formData.email));
        dispatch(setFromPage("register"));
       
        // Redirect to VerifyEmail page after 3 seconds
        setTimeout(() => {
          console.log("Redirecting to VerifyEmail with email from Redux:", formData.email);
          router.push(`/auth/verifyEmail`);
        }, 3000); // 3 seconds delay to show the success message
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response }); // Set isNetworkError for network issues
    }

    // Schedule the message to disappear after 5 seconds
    setTimeout(() => setResponseMessage(null), 3000);
  };

  return (
    <div className="Signup bg-primary-dark-green p-4" style={{ paddingTop: "90px", minHeight: "100vh" }}>
      <Header />
      {responseMessage && (
        <ApiResponseMessage
          success={responseMessage.success}
          message={responseMessage.message}
          onClose={() => setResponseMessage(null)}
          isNetworkError={responseMessage.isNetworkError}
        />
      )}
      <div className="form-card w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Get Started</h1>
        <p className="text-gray-600 mb-6">Please fill in your details to continue</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <InputField
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {showFields.email && (
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={validationResult.email}
              required
            />
          )}

          {showFields.phone && (
            <div>
              <PhoneInput
                label="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                onCountryChange={handleCountryChange}
                error={validationResult.phone}
                required
              />
            </div>
          )}

          {showFields.password && (
            <InputField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              error={validationResult.password}
              required
            />
          )}

          {showFields.confirmPassword && (
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type="password"
              error={validationResult.confirmPassword}
              required
            />
          )}

          {showFields.confirmPassword && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="mr-2"
                required
              />
              <label className="text-gray-600 text-sm">
                I have read and agreed to the Terms and Conditions
              </label>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center ${
              !isFormValid || isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-button-hover"
            }`}
            style={{ backgroundColor: "var(--primary-dark-green)", color: "var(--secondary-white)" }}
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
      </div>
      {/* Inline CSS for mobile-specific adjustment and scrolling */}
      <style jsx>{`
        @media (max-width: 600px) {
          .form-card {
            min-height: 0 !important; /* Allow dynamic height */
          }
          div {
            overflow-y: auto; /* Enable scrolling if content exceeds viewport */
          }
        }
      `}</style>
    </div>
  );
}