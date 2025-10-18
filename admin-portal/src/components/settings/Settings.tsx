import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { Save } from '@mui/icons-material';

const Settings: React.FC = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [settings, setSettings] = useState({
    siteName: 'Senior Connect',
    supportEmail: 'support@seniorconnect.com',
    maintenanceMode: false,
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = () => {
    // Simulate save
    setTimeout(() => {
      showSnackbar('Settings saved successfully!', 'success');
    }, 500);
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Configure your admin portal settings
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Site Name"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
            }
            label="Maintenance Mode"
          />
          <Typography variant="caption" display="block" color="textSecondary" sx={{ mb: 3 }}>
            Enable this to put the system in maintenance mode
          </Typography>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;