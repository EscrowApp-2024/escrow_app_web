"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately

// Hook to determine theme based on system preference
const getTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

// Menu items (you can customize these based on your app's routes)
const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Fund Wallet", path: "/fund-wallet" },
  { label: "Withdraw", path: "/withdraw" },
  { label: "Transactions", path: "/transactions" },
  { label: "Settings", path: "/settings" },
];

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <ThemeProvider theme={getTheme()}>
      {/* Fixed Header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "background.default",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: { xs: 1, sm: 2 },
          height: "64px",
        }}
      >
        {/* Application Name/Logo (Left Side) */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#1A3C34", fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          MiduPay
        </Typography>

        {/* Hamburger Menu Icon (Right Side) */}
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{ color: "text.primary" }}
          aria-label="open menu"
        >
          <MenuIcon sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }} />
        </IconButton>
      </Box>

      {/* Sliding Drawer Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "50%", // Covers half the page
            bgcolor: "background.default",
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer Header with Close Icon */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1A3C34", fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
            >
              MyApp
            </Typography>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: "text.primary" }}>
              <CloseIcon sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }} />
            </IconButton>
          </Box>

          {/* Menu Items */}
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={item.label}
                component={Link}
                href={item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: "0.5rem",
                  mb: 1,
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease, background-color 0.3s ease",
                  "&:hover": {
                    transform: "translateX(5px)",
                    bgcolor: "rgba(26, 60, 52, 0.05)",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{ color: "text.primary", fontWeight: 500, fontSize: "1rem" }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default Header;