"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately

// Mock data for demonstration (replace with real API data)
const banks = [
  { id: 1, name: "Guaranty Trust Bank" },
  { id: 2, name: "Access Bank" },
  { id: 3, name: "First Bank" },
];

export default function AddBankAccountPage() {
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const router = useRouter();

  const handleVerifyAccount = () => {
    // Mock API call to verify bank account (replace with real API)
    if (accountNumber) {
      // Simulate fetching bank details (e.g., prefill account name)
      setAccountName("Abdulazeez AyoMide Salawu"); // Replace with actual API response
    }
  };

  // Hook to determine theme based on system preference
  const getTheme = () => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return darkTheme;
    }
    return theme;
  };

  return (
    <ThemeProvider theme={getTheme()}>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default", minHeight: "100vh" }}>
        {/* Header with Back Icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              Add Bank Account
            </Typography>
          </Stack>
        </Stack>

        {/* Form Section */}
        <Stack spacing={3}>
          <TextField
            select
            label="Bank"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            variant="outlined"
            sx={{
              bgcolor: "background.paper",
              borderRadius: "0.5rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
            }}
          >
            {banks.map((bank) => (
              <MenuItem key={bank.id} value={bank.name}>
                {bank.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              label="Bank Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              variant="outlined"
              sx={{
                flex: 1,
                bgcolor: "background.paper",
                borderRadius: "0.5rem",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: "primary.main",
                color: "secondary.main",
                borderRadius: "0.75rem",
                padding: "0.75rem 1.5rem",
                "&:hover": { bgcolor: "#14352B" },
                "&:active": { bgcolor: "#102520" },
                "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
              }}
              onClick={handleVerifyAccount}
            >
              Verify
            </Button>
          </Stack>
          <TextField
            label="Bank Account Name"
            value={accountName}
            InputProps={{ readOnly: true }}
            variant="outlined"
            sx={{
              bgcolor: "background.paper",
              borderRadius: "0.5rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
            label="Set as default bank account"
            sx={{ color: "text.secondary" }}
          />

          {/* Notice Box */}
          <Box sx={{ bgcolor: "rgba(26, 60, 52, 0.05)", p: 2, borderRadius: "0.5rem" }}>
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}>
              <strong>Note:</strong>
            </Typography>
            <ul style={{ margin: "0", paddingLeft: "20px", color: "text.secondary" }}>
              <li>Check to ensure that the account information is accurate</li>
              <li>Withdrawal transactions will encounter errors if the account information is not accurate</li>
            </ul>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={{
                flex: 1,
                color: "text.primary",
                borderColor: "grey.300",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { borderColor: "grey.400", bgcolor: "grey.100" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: "primary.main",
                color: "secondary.main",
                textTransform: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                "&:hover": { bgcolor: "#14352B" },
                "&:active": { bgcolor: "#102520" },
                "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
              }}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}