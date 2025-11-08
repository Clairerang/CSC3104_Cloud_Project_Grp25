import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_GATEWAY || "http://localhost:8083";

const ElderlyLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, role } = response.data;

        if (role !== "elderly") {
          setError("This account is not an elderly account.");
          return;
        }

        localStorage.setItem("authToken", token);

        // ✅ redirect to elderly dashboard
        window.location.href = "/app"; // senior-app index page
      }
    } catch (err: any) {
      setError("Invalid email or password.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, width: "100%", maxWidth: 420, textAlign: "center", borderRadius: 3 }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Elderly Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ py: 1.5, fontSize: 16 }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ElderlyLogin;
