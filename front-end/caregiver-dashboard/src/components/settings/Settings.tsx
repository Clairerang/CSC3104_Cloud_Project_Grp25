import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  TextField, 
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import {
  Person,
  Group,
  Notifications,
  DarkMode,
  Edit,
  Add,
  Delete,
  Save,
} from '@mui/icons-material';
import { getSeniorsList } from '../../api/mockData';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    missedCheckIn: true,
  });

  const [darkMode, setDarkMode] = useState(false);

  const seniors = getSeniorsList();

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Here you would typically save to API
    console.log('Profile saved:', profile);
  };

  const handleRemoveSenior = (seniorName: string) => {
    // Here you would typically remove from API
    console.log('Removing senior:', seniorName);
  };

  const handleAddSenior = () => {
    // Here you would typically open a dialog to add senior
    console.log('Adding new senior');
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f9fafb' }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
            Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Manage your profile and preferences
          </Typography>
        </Box>

        {/* Profile Section */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Person sx={{ color: '#6b7280', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Profile Information
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#e3f2fd', color: '#1976d2' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              sx={{ borderRadius: 2 }}
            >
              Change Photo
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
            <TextField
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => handleProfileChange('fullName', e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Phone"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveProfile}
            sx={{ borderRadius: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Save Changes
          </Button>
        </Card>

        {/* Linked Seniors */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Group sx={{ color: '#6b7280', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Linked Seniors
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {seniors.map((senior, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#f3f4f6', color: '#6b7280' }}>
                    {senior.initials}
                  </Avatar>
                  <Typography sx={{ fontWeight: 500, color: '#111827' }}>
                    {senior.name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSenior(senior.name)}
                  sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                >
                  <Delete />
                </IconButton>
              </Paper>
            ))}
          </Box>

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddSenior}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Add Senior
          </Button>
        </Card>

        {/* Notification Preferences */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Notifications sx={{ color: '#6b7280', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Notification Preferences
            </Typography>
          </Box>

          {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 500, color: '#111827', mb: 0.5 }}>
                    Email Notifications
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    Receive alerts via email
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 500, color: '#111827', mb: 0.5 }}>
                    Push Notifications
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    Receive browser notifications
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 500, color: '#111827', mb: 0.5 }}>
                    Missed Check-in Alerts
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                    Alert when seniors miss check-ins
                  </Typography>
                </Box>
                <Switch
                  checked={notifications.missedCheckIn}
                  onChange={(e) => handleNotificationChange('missedCheckIn', e.target.checked)}
                />
              </Box>
            </Paper>
          </Box> */}
        </Card>

      </Box>
    </Box>
  );
};

export default Settings;
