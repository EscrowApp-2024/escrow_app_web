"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Button,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { JSX } from "react/jsx-runtime";

// Mock data (replace with real API data)
const user = { firstName: "Godwin", availableBalance: 10000 }; // NGN

// Define the Payment Method interface
interface PaymentMethod {
  value: string;
  label: string;
  fee: string;
  icon: JSX.Element;
}

// Hook to determine theme based on system preference
const getTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

const FundWallet: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank-transfer");
  const router = useRouter();

  // List of payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      value: "bank-transfer",
      label: "Direct Bank Transfer",
      fee: "₦100.00",
      icon: <AccountBalanceIcon sx={{ color: "#FFFFFF", fontSize: "1.5rem" }} />,
    },
    {
      value: "debit-card",
      label: "NGN Debit/Credit Card (Korapay)",
      fee: "₦70.00",
      icon: <CreditCardIcon sx={{ color: "#FFFFFF", fontSize: "1.5rem" }} />,
    },
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric values with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleProceed = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (parseFloat(amount) > user.availableBalance) {
      alert(`Not Enough Money: Balance is ${user.availableBalance} NGN`);
      return;
    }
    // Navigate to a confirmation page (placeholder)
    console.log(`Proceeding with ${paymentMethod} for amount ₦${amount}`);
    router.push(`/fund-wallet/confirm?amount=${amount}&method=${paymentMethod}`);
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          p: { xs: 2, sm: 3 },
        }}
        style={{ paddingBottom: "80px" }}
      >
        {/* Header with Back Icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A3C34" }}>
              Fund Wallet
            </Typography>
          </Stack>
        </Stack>

        {/* Amount Input Section */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Amount to Fund
          </Typography>
          <TextField
            type="number"
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            InputProps={{
              startAdornment: (
                <Typography sx={{ color: "text.primary", mr: 1, fontSize: "1.5rem" }}>₦</Typography>
              ),
              sx: {
                borderRadius: "0.5rem",
                bgcolor: "background.paper",
                border: "1px solid #e0e0e0",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:focus-within": {
                  borderColor: "#1A3C34",
                  boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.1)",
                },
              },
            }}
            sx={{ "& .MuiInputBase-input": { fontSize: "1.5rem", color: "text.primary", p: "0.75rem" } }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Balance: {user.availableBalance} NGN
          </Typography>
        </Stack>

        {/* Select Payment Type Section */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Select Payment Type
            </Typography>
          </Stack>
          <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
            {paymentMethods.map((method) => (
              <Box
                key={method.value}
                sx={{
                  bgcolor: "background.paper",
                  p: 2,
                  borderRadius: "0.5rem",
                  mb: 1,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      bgcolor: "#1A3C34",
                      borderRadius: "0.4rem",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {method.icon}
                  </Box>
                  <Stack>
                    <Typography variant="body1" sx={{ color: "text.primary" }}>
                      {method.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Fee: {method.fee}
                    </Typography>
                  </Stack>
                </Stack>
                <FormControlLabel
                  value={method.value}
                  control={<Radio sx={{ color: "#1A3C34", "&.Mui-checked": { color: "#1A3C34" } }} />}
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            ))}
          </RadioGroup>
        </Stack>

        {/* Note Section */}
        <Box
          sx={{
            bgcolor: "rgba(26, 60, 52, 0.05)",
            p: 2,
            borderRadius: "0.5rem",
            mb: 4,
          }}
        >
          <Typography variant="body2" sx={{ color: "#1A3C34", fontWeight: 600, mb: 1 }}>
            Note:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "text.secondary" }}>
            <li>Check the funding details above to verify that it is correct</li>
            <li>Third party funding is not allowed</li>
            <li>Estimated time to complete: a few seconds</li>
          </ul>
        </Box>

        {/* Proceed Button */}
        <Button
          variant="contained"
          onClick={handleProceed}
          sx={{
            bgcolor: "#1A3C34",
            color: "#FFFFFF",
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "0.75rem",
            padding: "0.75rem 1.5rem",
            "&:hover": { bgcolor: "#14352B" },
            "&:active": { bgcolor: "#102520" },
            "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
          }}
          fullWidth
        >
          Proceed
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default FundWallet;