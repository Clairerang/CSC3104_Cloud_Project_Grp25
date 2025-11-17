import React, { useState, useEffect } from 'react';
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
  Paper,
  CircularProgress
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
import { Profile, NotificationSettings } from '../api/mockData';
import { useAuth } from '../../components/auth/AuthContext';
import { caregiverApi } from '../api/client';

interface LinkedSenior {
  id: string;
  name: string;
  initials: string;
  relation: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    address: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    missedCheckIn: true,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [seniors, setSeniors] = useState<LinkedSenior[]>([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch current user's profile data from backend
        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('[Settings] Fetched user data:', userData);
          setProfile({
            fullName: userData.profile?.name || user?.name || '',
            email: userData.profile?.email || user?.email || '',
            phone: userData.profile?.contact || '',
            username: userData.username || '',
            address: '', // Address not currently stored in backend
          });
        } else {
          console.error('[Settings] Failed to fetch user data, status:', response.status);
          // Fallback to user from AuthContext
          setProfile({
            fullName: user?.name || '',
            email: user?.email || '',
            phone: '',
            username: '',
            address: '',
          });
        }

        // Fetch linked seniors
        const seniorsResponse = await caregiverApi.getSeniors();
        console.log('[Settings] Fetched seniors:', seniorsResponse);
        const linkedSeniors = seniorsResponse.seniors.map(item => {
          const seniorName = item.senior.profile?.name || item.senior.username;
          const getInitials = (name: string) => {
            const matches = name.match(/\b\w/g);
            return matches ? matches.join('').slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase();
          };

          return {
            id: item.seniorId,
            name: seniorName,
            initials: getInitials(seniorName),
            relation: item.relation,
          };
        });
        setSeniors(linkedSeniors);

      } catch (error) {
        console.error('Error loading settings data:', error);
        // Set profile from AuthContext as fallback
        if (user) {
          setProfile({
            fullName: user.name,
            email: user.email,
            phone: '',
            username: '',
            address: '',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = async (field: string, value: boolean) => {
    const updated = { ...notifications, [field]: value };
    setNotifications(updated);
    // TODO: Add API endpoint to update notification settings
    console.log('Notification settings updated:', updated);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          profile: {
            name: profile.fullName,
            email: profile.email,
            contact: profile.phone
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Settings] Profile updated successfully:', data);
        setIsEditing(false);
      } else {
        const error = await response.json();
        console.error('[Settings] Failed to update profile:', error);
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Settings] Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
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

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
            <TextField
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => handleProfileChange('fullName', e.target.value)}
              fullWidth
              disabled={!isEditing}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              fullWidth
              disabled={!isEditing}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Phone"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              fullWidth
              disabled={!isEditing}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Username"
              value={profile.username}
              onChange={(e) => handleProfileChange('username', e.target.value)}
              fullWidth
              disabled={!isEditing}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Address"
              value={profile.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              fullWidth
              disabled={!isEditing}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                sx={{ borderRadius: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => {
                    handleSaveProfile();
                    setIsEditing(false);
                  }}
                  sx={{ borderRadius: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Box>
        </Card>

        {/* Linked Seniors */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
            <Group sx={{ color: '#6b7280', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
              Linked Seniors
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : seniors.length === 0 ? (
            <Typography sx={{ color: '#6b7280', py: 2 }}>
              No seniors are currently linked to your account.
            </Typography>
          ) : (
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
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2', color: 'white' }}>
                      {senior.initials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 500, color: '#111827' }}>
                        {senior.name}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                        Relation: {senior.relation}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default Settings;
