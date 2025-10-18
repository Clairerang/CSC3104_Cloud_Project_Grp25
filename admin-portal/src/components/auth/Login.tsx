import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { api } from '../../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if using mock data for development
    const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';

    if (useMockData) {
      // MOCK AUTHENTICATION (for development without backend)
      setTimeout(() => {
        const mockUser = {
          id: 'admin-1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
        };
        const mockToken = 'mock-jwt-token-' + Date.now();

        localStorage.setItem('adminToken', mockToken);
        localStorage.setItem('adminUser', JSON.stringify(mockUser));

        navigate('/dashboard');
        setLoading(false);
      }, 1000); // Simulate network delay
    } else {
      // REAL API AUTHENTICATION (when backend is ready)
      try {
        const response = await api.auth.login(credentials);
        const { token, user } = response.data;

        // Check if user is admin
        if (user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Store auth data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err: any) {
        setError(
          err.response?.data?.message || 
          'Login failed. Please check your credentials.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 48, color: 'white' }} />
            </Box>
            <Typography component="h1" variant="h4" fontWeight="bold">
              Admin Portal
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Senior Connect Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              © 2025 Senior Connect. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;