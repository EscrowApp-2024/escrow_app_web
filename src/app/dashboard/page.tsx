"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Avatar,
  Stack,
  Typography,
  IconButton,
  Badge,
  Box,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentIcon from "@mui/icons-material/Payment";
import HandshakeIcon from "@mui/icons-material/Handshake";
import NavigationMenu from "@/components/UI/navigationMenu"; // Adjust path based on your project structure
import { JSX } from "react/jsx-runtime";

// Define interfaces for the data
interface Balance {
  type: string;
  amount: string;
  currency: { symbol: string; code: string };
}

interface Transaction {
  id: number;
  title: string;
  amount: string;
  date: string;
  icon?: JSX.Element;
  image?: string;
  status: string;
}

interface User {
  firstName: string;
  lastName: string;
  profileImage: string;
}

// Function to preformat dates consistently
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date
    .toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", ""); // e.g., "03/08/2025 02:30 PM"
};

// Function to get the appropriate currency icon based on code
const getCurrencyIcon = (currencyCode: string): string => {
  switch (currencyCode.toUpperCase()) {
    case "NGN":
      return "₦"; // Naira symbol
    case "USD":
      return "$"; // Dollar symbol
    case "EUR":
      return "€"; // Euro symbol
    case "GBP":
      return "£"; // Pound symbol
    default:
      return "$"; // Default to dollar if unknown
  }
};

const Dashboard: React.FC = () => {
  const [currentBalanceCard, setCurrentBalanceCard] = useState<number>(0); // 0: Available, 1: Locked
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const user: User = {
    firstName: "Godwin",
    lastName: "Doe",
    profileImage: "/placeholder-profile.jpg",
  };

  const balances: Balance[] = [
    { type: "Available Balance", amount: "65,000.00", currency: { symbol: "₦", code: "NGN" } },
    { type: "Locked Balance", amount: "15,000.00", currency: { symbol: "$", code: "USD" } },
  ];

  // Sample transaction data with preformatted dates
  const transactions: Transaction[] = [
    {
      id: 1,
      title: "Wallet Funded",
      amount: "+N10,000.00",
      date: formatDate("2025-03-08 14:30"),
      icon: <AccountBalanceWalletIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Completed",
    },
    {
      id: 2,
      title: "Wallet Withdrawal",
      amount: "-N5,000.00",
      date: formatDate("2025-03-07 09:15"),
      icon: <PaymentIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Pending",
    },
    {
      id: 3,
      title: "Escrow Transaction",
      amount: "N20,000.00",
      date: formatDate("2025-03-06 16:45"),
      icon: <HandshakeIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Ongoing",
    },
    {
      id: 4,
      title: "Wallet Funded",
      amount: "+N15,000.00",
      date: formatDate("2025-03-05 12:00"),
      icon: <AccountBalanceWalletIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Failed",
    },
    {
      id: 5,
      title: "Wallet Withdrawal",
      amount: "-N8,000.00",
      date: formatDate("2025-03-04 10:30"),
      icon: <PaymentIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Completed",
    },
    {
      id: 6,
      title: "Escrow Transaction",
      amount: "N12,000.00",
      date: formatDate("2025-03-03 08:15"),
      icon: <HandshakeIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />,
      status: "Dispute",
    },
  ];

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      const minSwipeDistance = 50;
      if (distance > minSwipeDistance && currentBalanceCard < balances.length - 1) {
        setCurrentBalanceCard(currentBalanceCard + 1);
      } else if (distance < -minSwipeDistance && currentBalanceCard > 0) {
        setCurrentBalanceCard(currentBalanceCard - 1);
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4" style={{ paddingBottom: "80px" }}>
      {/* Top Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, bgcolor: "background.default", mb: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={`${user.firstName} ${user.lastName}`}
            src={user.profileImage}
            sx={{ width: 36, height: 36 }}
          />
          <Stack>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "text.primary", fontSize: "1.1rem" }}
            >
              Hello, {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              Welcome back! 😊
            </Typography>
          </Stack>
        </Stack>
        <IconButton>
          <Badge badgeContent={2} color="error">
            <NotificationsIcon sx={{ color: "text.primary", fontSize: "1.3rem" }} />
          </Badge>
        </IconButton>
      </Stack>

      {/* Wallet Balance Cards */}
      <Box sx={{ mb: 4, position: "relative", overflow: "hidden" }}>
        <Box
          ref={cardRef}
          sx={{
            display: "flex",
            transition: "transform 0.3s ease-in-out",
            transform: `translateX(-${currentBalanceCard * 100}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {balances.map((balance, index) => (
            <Box
              key={index}
              sx={{
                minWidth: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                color: "#FFFFFF",
                borderRadius: "0.8rem",
                p: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                flexShrink: 0,
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                pl: 2,
                minHeight: "120px",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: "black", mb: 1, fontWeight: 500, fontSize: "0.9rem" }}
              >
                {balance.type}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ pl: 1, display: "inline-flex" }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#FFFFFF", fontSize: "1.5rem", lineHeight: "1.5rem" }}
                >
                  {getCurrencyIcon(balance.currency.code)}
                  {balance.amount}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: "#B0B0B0", mt: 1, fontSize: "0.8rem", pl: 1 }}
              >
                {balance.currency.code}
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
            </Box>
          ))}
        </Box>
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
          {balances.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: index === currentBalanceCard ? "#1A3C34" : "#666",
                border: "2px solid #1A3C34",
              }}
            />
          ))}
        </Stack>
      </Box>
     {/* Wallet Actions with Links */}
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Link href="/fund-wallet" passHref style={{ flex: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: "#1A3C34",
              color: "#FFFFFF",
              p: 1.5,
              borderRadius: "0.8rem",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": { backgroundColor: "#14352B" },
              "&:active": { backgroundColor: "#102520" },
            }}
            startIcon={<AccountBalanceWalletIcon sx={{ fontSize: "1.3rem" }} />}
          >
            Fund Wallet
          </Button>
        </Link>
        <Link href="/withdraw" passHref style={{ flex: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: "#1A3C34",
              color: "#FFFFFF",
              p: 1.5,
              borderRadius: "0.8rem",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": { backgroundColor: "#14352B" },
              "&:active": { backgroundColor: "#102520" },
            }}
            startIcon={<PaymentIcon sx={{ fontSize: "1.3rem" }} />}
          >
            Withdraw
          </Button>
        </Link>
      </Stack>

      {/* New Escrow Transaction Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{
          backgroundColor: "#1A3C34",
          color: "#FFFFFF",
          p: 1.5,
          borderRadius: "0.8rem",
          textTransform: "none",
          width: "100%",
          mb: 6,
          fontSize: "0.9rem",
          "&:hover": { backgroundColor: "#14352B" },
          "&:active": { backgroundColor: "#102520" },
        }}
      >
        New Escrow Transaction
      </Button>

      {/* Recent Transactions with Fixed Header */}
      <Box sx={{ mb: 6, position: "relative" }}>
        {/* Fixed Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "background.default",
            zIndex: 10,
            pt: 1,
            pb: 1,
          }}
        >
          <div className="flex justify-between">
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem" }}>
              Recent Transactions
            </Typography>
            <Link href="/transactions" passHref>
              <Typography variant="body2" sx={{ color: "#1A3C34", cursor: "pointer", fontSize: "0.9rem" }}>
                See all
              </Typography>
            </Link>
          </div>
        </Box>

        {/* Scrollable Transaction List */}
        <Box
          sx={{
            maxHeight: "calc(100vh - 350px)",
            overflowY: "auto",
            px: 1,
          }}
        >
          {transactions.map((tx) => (
            <Box
              key={tx.id}
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: "0.8rem",
                p: 1.5,
                mb: 2,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              <Box sx={{ mr: 1.5 }}>
                {tx.icon ? (
                  tx.icon
                ) : tx.image ? (
                  <img
                    src={tx.image}
                    alt={tx.title}
                    style={{ width: "36px", height: "36px", borderRadius: "50%" }}
                  />
                ) : (
                  <HandshakeIcon sx={{ color: "#1A3C34", fontSize: "1.3rem" }} />
                )}
              </Box>
              <Stack flex={1}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.95rem" }}
                >
                  {tx.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  {tx.date}
                </Typography>
              </Stack>
              <Stack alignItems="flex-end">
                <Typography
                  variant="h6"
                  sx={{
                    color:
                      tx.amount.startsWith("+")
                        ? "#2E7D32"
                        : tx.amount.startsWith("-")
                        ? "#D32F2F"
                        : "#424242",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  {tx.amount}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      tx.status === "Completed" || tx.status === "Dispute"
                        ? "#2E7D32"
                        : tx.status === "Pending" || tx.status === "Ongoing"
                        ? "#ED6C02"
                        : "#D32F2F",
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    p: "2px 6px",
                    borderRadius: "0.4rem",
                    fontSize: "0.75rem",
                  }}
                >
                  {tx.status}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reused Navigation Menu */}
      <NavigationMenu />
    </div>
  );
};

export default Dashboard;