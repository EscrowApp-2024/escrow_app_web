"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MdArrowBack } from "react-icons/md";
import InputField from "@/components/UI/InputField";
import Header from "@/components/UI/header";
import ApiResponseMessage from "@/components/UI/ApiResponseMessage";
import { AuthService } from "@/services/Auth_Session_Manager";
import { ApiResponseHandler } from "@/lib/ApiResponseHandler";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Forgot Password, 2: Reset Password
  const [formData, setFormData] = useState({ email: "", code: ["", "", "", "", "", ""], password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ email: "", code: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{
    success: boolean;
    message: string;
    isNetworkError?: boolean;
  } | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const validateEmail = useCallback(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "" : "Invalid email address";
  }, [formData.email]);

  const validateCode = useCallback(() => {
    const codeString = formData.code.join("");
    return codeString.length === 6 && /^\d{6}$/.test(codeString) ? "" : "Invalid verification code";
  }, [formData.code]);

  const validatePassword = useCallback(() => {
    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password);
    return isStrong ? "" : "Password must be 8+ characters with upper, lower, number, and special char";
  }, [formData.password]);

  const validateConfirmPassword = useCallback(() => {
    return formData.password === formData.confirmPassword ? "" : "Passwords do not match";
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    setErrors({
      email: validateEmail(),
      code: validateCode(),
      password: validatePassword(),
      confirmPassword: validateConfirmPassword(),
    });
  }, [formData, validateEmail, validateCode, validatePassword, validateConfirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newCode = [...formData.code];
      newCode[index] = value;
      setFormData((prev) => ({ ...prev, code: newCode }));

      if (value && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      const newCode = [...formData.code];
      newCode[index - 1] = "";
      setFormData((prev) => ({ ...prev, code: newCode }));
      inputsRef.current[index - 1]?.focus();
    }
  };

  const isFormValid = step === 1
    ? !errors.email && formData.email
    : !errors.code && !errors.password && !errors.confirmPassword && formData.password && formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setResponseMessage(null);

    try {
      if (step === 1) {
        const payload = { email: formData.email };
        const result = await AuthService.forgotPassword(payload);
        setIsLoading(false);

        if (result.success) {
          setStep(2);
          setResponseMessage({ success: true, message: "Reset code sent to your email" });
        } else {
          setResponseMessage({ success: false, message: result.message });
        }
      } else if (step === 2) {
        const payload = {
          email: formData.email,
          code: formData.code.join(""),
          password: formData.password
        };
        const result = await AuthService.resetPassword(payload);
        setIsLoading(false);

        if (result.success) {
          setResponseMessage({ success: true, message: "Password reset successful" });
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        } else {
          setResponseMessage({ success: false, message: result.message });
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorResult = ApiResponseHandler.handleError(error);
      setResponseMessage({ ...errorResult, isNetworkError: !error.response });
    }

    setTimeout(() => setResponseMessage(null), 5000);
  };

  return (
    <div className="bg-primary-dark-green p-4" style={{ paddingTop: "90px", minHeight: "100vh" }}>
      <Header />
      {responseMessage && (
        <ApiResponseMessage
          success={responseMessage.success}
          message={responseMessage.message}
          onClose={() => setResponseMessage(null)}
          isNetworkError={responseMessage.isNetworkError}
        />
      )}
      <div className="form-card bg-white p-6 rounded-lg shadow-md w-full">
        <button 
          className="text-text-gray focus:outline-none mr-2" 
          aria-label="Back"
          onClick={() => router.push("/auth/login")}
        >
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-gray-600">
            {step === 1
              ? "Please enter your email to reset your password: "
              : `Enter the 6-digit code sent to your email and your new password:`}
            <span className="text-blue-600 mt-1">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {formData.code.map((digit, index) => (
                  <input
                    key={index}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleCodeChange(e, index)}
                    onKeyDown={(e) => handleCodeKeyDown(e, index)}
                    maxLength={1}
                    className="digit-input"
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                  />
                ))}
              </div>
              {errors.code && <p className="error text-center">{errors.code}</p>}

              <InputField
                label="New Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                error={errors.password}
                required
              />

              <InputField
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password"
                error={errors.confirmPassword}
                required
              />
            </>
          )}

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
            {isLoading ? "Processing..." : (step === 1 ? "Submit" : "Create New Password")}
          </button>
        </form>
      </div>
    </div>
  );
}