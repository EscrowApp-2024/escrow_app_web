"use client";

import { useState, useEffect } from "react";
import { countries } from "@/lib/countries";
import { BsChevronDown } from "react-icons/bs";

interface PhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCountryChange: (countryId: string) => void; // New prop to pass country ID to parent
  error?: string;
  required?: boolean;
}

export default function PhoneInput({
  label,
  value,
  onChange,
  onCountryChange,
  error,
  required,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [mobileNumber, setMobileNumber] = useState(""); // Store the user-entered mobile number (without country code)

  useEffect(() => {
    // Initialize the value with the selected country code
    const code = selectedCountry.code;
    if (!value.startsWith(code)) {
      onChange(code); // Prefill with country code if not present
      setMobileNumber(""); // Reset mobile number
    } else {
      // Extract the mobile number (without the country code)
      setMobileNumber(value.replace(code, ""));
    }

    // Notify parent of the selected country ID
    onCountryChange(selectedCountry.id);
  }, [selectedCountry, value, onChange, onCountryChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find((c) => c.code === e.target.value);
    if (country) {
      setSelectedCountry(country);
      const newValue = country.code; // Reset to just the country code
      setMobileNumber(""); // Clear mobile number when country changes
      onChange(newValue);
      onCountryChange(country.id); // Notify parent of new country ID
    }
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
    setMobileNumber(input);
    const fullNumber = `${selectedCountry.code}${input}`; // Combine country code with mobile number
    onChange(fullNumber);
  };

  return (
    <div className="w-full">
      <label className="block text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="input-field relative flex items-center border border-gray-300 rounded-md">
        {/* Country Selector */}
        <div
          className="flex items-center pl-2 pr-1 cursor-pointer"
          onClick={() => document.querySelector("select")?.focus()}
        >
          <img src={selectedCountry.flag} alt={`${selectedCountry.name} flag`} className="w-8 h-8 mr-1" />
          <BsChevronDown className="text-gray-500 w-4 h-4" />
        </div>
        <select
          value={selectedCountry.code}
          onChange={handleCountryChange}
          className="appearance-none bg-transparent border-none focus:outline-none w-12 absolute left-2 opacity-0"
        >
          {countries.map((country) => (
            <option key={country.id} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        {/* Country Code (Non-editable) + Mobile Number Input */}
        <div className="flex items-center w-full">
          <span className="text-gray-600 pl-2 pr-1">{selectedCountry.code}</span>
          <input
            type="tel"
            value={mobileNumber}
            onChange={handleMobileNumberChange}
            placeholder="Enter mobile number"
            className="w-full py-1 bg-transparent border-none focus:outline-none"
            required={required}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}