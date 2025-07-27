"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme"; // Adjust path based on your project structure
import darkTheme from "@/lib/theme"; // Adjust path if darkTheme is exported separately

// Material-UI Icons for each section
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import GavelIcon from "@mui/icons-material/Gavel";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import NavigationMenu from "@/components/UI/navigationMenu"; // Adjust path based on your project structure

import { logoutUser } from "@/utils/logoutUser";


interface user {
  email: string;
  first_name: string;
  last_name: string;
}


// Hook to determine theme based on system preference
const getTheme = (): any => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return darkTheme;
  }
  return theme;
};

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const router = useRouter();
  const dispatch = useDispatch();

  const [userDetails, setUserdetails] = useState<user| null>(null)

  useEffect(() => {
    const getUserDetails = localStorage.getItem("user_session_data");
    if (getUserDetails) {
      const parsedDetails = JSON.parse(getUserDetails);
      setUserdetails({
        email: parsedDetails.email,
        first_name: parsedDetails.first_name,
        last_name: parsedDetails.last_name
      })
    }
  }, []);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // Optionally persist the user's preference (e.g., in localStorage or backend)
  };

  const handleLogout = () => {
  logoutUser(dispatch, router);
};


  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <Box
        sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, sm: 3 } }}
        style={{ paddingBottom: "80px" }}
      >
        {/* Header with Back Icon */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => router.back()} sx={{ color: "text.primary" }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
              Settings
            </Typography>
          </Stack>
        </Stack>

        {/* Profile Section */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Avatar
            src={userDetails?.first_name}
            alt={userDetails?.first_name}
            sx={{ width: 64, height: 64, bgcolor: "primary.main" }}
          />
          <Stack>
            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
              {userDetails?.first_name} {userDetails?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {userDetails?.email}
            </Typography>
          </Stack>
        </Stack>

        {/* Account Section */}
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}>
          Account
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: "0.5rem", mb: 2 }}>
          <ListItem onClick={() => router.push("/dashboard/settings/profile")}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Profile" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <Divider />
          <ListItem onClick={() => router.push("/dashboard/settings/add-bank")}>
            <ListItemIcon>
              <AccountBalanceIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Withdrawal Bank" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <ListItem onClick={() => router.push("/settings/kyc")}>
            <ListItemIcon>
              <VerifiedUserIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="KYC" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
        </List>

        {/* Privacy and Security Section */}
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}>
         Privacy and Security
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: "0.5rem", mb: 2 }}>
          <ListItem onClick={() => router.push("/dashboard/settings/change-password")}>
            <ListItemIcon>
              <LockIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Change Password" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>  
        </List>

        {/* Preferences Section */}
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}>
          Preferences
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: "0.5rem", mb: 2 }}>
          <ListItem onClick={() => router.push("/settings/language")}>
            <ListItemIcon>
              <LanguageIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Language" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <Brightness4Icon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Dark Mode" sx={{ color: "text.primary" }} />
            <Switch
              checked={darkMode}
              onChange={handleDarkModeToggle}
              sx={{
                "& .MuiSwitch-thumb": { bgcolor: darkMode ? "primary.main" : "grey.400" },
                "& .MuiSwitch-track": { bgcolor: darkMode ? "primary.main" : "grey.300" },
              }}
            />
          </ListItem>
        </List>

        {/* Help and Support Section */}
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 500, mb: 1 }}>
          Help and Support
        </Typography>
        <List sx={{ bgcolor: "background.paper", borderRadius: "0.5rem", mb: 2 }}>
          <ListItem onClick={() => router.push("/settings/legal")}>
            <ListItemIcon>
              <GavelIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Legal" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <ListItem onClick={() => router.push("/settings/get-help")}>
            <ListItemIcon>
              <HelpIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Get Help" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <ListItem onClick={() => router.push("/settings/about-us")}>
            <ListItemIcon>
              <InfoIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="About Us" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
          <Divider />
          <ListItem onClick={() => router.push("/settings/help-faq")}>
            <ListItemIcon>
              <ContactSupportIcon sx={{ color: "text.primary" }} />
            </ListItemIcon>
            <ListItemText primary="Help/FAQ" sx={{ color: "text.primary" }} />
            <ChevronRightIcon sx={{ color: "text.secondary" }} />
          </ListItem>
        </List>

        {/* Logout Button */}
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "primary.main",
            color: "secondary.main",
            textTransform: "none",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            "&:hover": { bgcolor: "#14352B" },
            "&:active": { bgcolor: "#102520" },
            "&:focus": { boxShadow: "0 0 0 3px rgba(26, 60, 52, 0.2)" },
          }}
          fullWidth
          startIcon={<LogoutIcon />}
        >
          Log Out
        </Button>

        {/* Reused Navigation Menu */}
        <NavigationMenu />
      </Box>
    </ThemeProvider>
  );
};

export default SettingsPage;