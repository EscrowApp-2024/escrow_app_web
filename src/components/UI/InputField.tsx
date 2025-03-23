"use client";

import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  required?: boolean;
}

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  required,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full">
      <label className="block text-gray-600 mb-1">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="input-field relative">
        <input
          type={isPasswordField && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full  py-1 bg-transparent border-none focus:outline-none"
          required={required}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}