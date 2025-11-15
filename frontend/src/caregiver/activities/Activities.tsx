import {
    Add,
} from '@mui/icons-material';
import {
    Box,
    Button,
    CircularProgress,
    Alert as MuiAlert,
    Snackbar,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import caregiverApi, { Activity } from '../api/client';
import ActivityFormDialog from './ActivityFormDialog';
import ActivityListSection from './ActivityListSection';

interface Senior {
  id: string;
  name: string;
  initials: string;
}

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [activitiesResponse, seniorsResponse] = await Promise.all([
          caregiverApi.getActivities(),
          caregiverApi.getSeniors(),
        ]);
        
        setActivities(activitiesResponse.activities);
        
        const seniorsList = seniorsResponse.seniors.map(item => ({
          id: item.seniorId,
          name: item.senior.profile?.name || item.senior.username,
          initials: item.senior.profile?.name
            ? item.senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'UK',
        }));
        setSeniors(seniorsList);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError('Failed to load activities. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddActivity = async (activityData: { senior: string; title: string; date: string; time: string; description: string }) => {
    const seniorData = seniors.find(s => s.name === activityData.senior);
    if (!seniorData) {
      throw new Error('Selected senior not found');
    }
    
    try {
      const response = await caregiverApi.createActivity({
        seniorId: seniorData.id,
        title: activityData.title,
        description: activityData.description,
        date: activityData.date,
        time: activityData.time,
        type: 'visit',
      });
      
      setActivities(prev => [...prev, response.activity]);
      setSnackbar({ open: true, message: 'Activity created successfully', severity: 'success' });
    } catch (err) {
      console.error('Error creating activity:', err);
      setSnackbar({ open: true, message: 'Failed to create activity', severity: 'error' });
      throw err;
    }
  };

  const handleSubmit = async (activityData: { senior: string; title: string; date: string; time: string; description: string }) => {
    await handleAddActivity(activityData);
  };

  const deleteActivity = async (id: string | number) => {
    try {
      await caregiverApi.deleteActivity(String(id));
      setActivities(prev => prev.filter(a => a.id !== id && a.activityId !== id));
      setSnackbar({ open: true, message: 'Activity deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting activity:', err);
      setSnackbar({ open: true, message: 'Failed to delete activity', severity: 'error' });
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const markAsCompleted = async (id: string | number) => {
    try {
      const activity = activities.find(a => a.id === id || a.activityId === id);
      if (activity) {
        await caregiverApi.updateActivity(activity.activityId, { status: 'completed' });
        setActivities(prev => prev.map(a => 
          (a.id === id || a.activityId === id) ? { ...a, status: 'completed' as const } : a
        ));
        setSnackbar({ open: true, message: 'Activity marked as completed', severity: 'success' });
      }
    } catch (err) {
      console.error('Error marking activity as completed:', err);
      setSnackbar({ open: true, message: 'Failed to update activity', severity: 'error' });
    }
  };

  const upcomingActivities = activities.filter(a => ['pending', 'accepted'].includes(a.status));
  const rejectedActivities = activities.filter(a => a.status === 'rejected');
  const completedActivities = activities.filter(a => a.status === 'completed');
  const cancelledActivities = activities.filter(a => a.status === 'cancelled');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 6 }}>
        <MuiAlert severity="error">{error}</MuiAlert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f9fafb' }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
              Planned Activities
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280' }}>
              Schedule and manage activities with your seniors
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Add Activity
          </Button>
        </Box>

        {/* Add/Edit Activity Dialog */}
        <ActivityFormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          seniors={seniors}
        />

        {/* Upcoming Activities */}
        <ActivityListSection
          title="Upcoming Activities"
          activities={upcomingActivities}
          isCompleted={false}
          onDelete={deleteActivity}
          onMarkCompleted={markAsCompleted}
        />

        {/* Rejected Activities */}
        {rejectedActivities.length > 0 && (
          <ActivityListSection
            title="Rejected Activities"
            activities={rejectedActivities}
            isCompleted={false}
            onDelete={deleteActivity}
          />
        )}

        {/* Completed Activities */}
        <ActivityListSection
          title="Recently Completed"
          activities={completedActivities}
          isCompleted={true}
          onDelete={deleteActivity}
        />

        {/* Cancelled Activities */}
        {cancelledActivities.length > 0 && (
          <ActivityListSection
            title="Cancelled Activities"
            activities={cancelledActivities}
            isCompleted={true}
            onDelete={deleteActivity}
          />
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Activities;
