import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';

import { mockApi, Activity, getSeniorsList } from '../api/mockData';
import ActivityFormDialog from './ActivityFormDialog';
import ActivityListSection from './ActivityListSection';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const seniors = getSeniorsList();

  // Load data from API
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activitiesData = await mockApi.getActivities();
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    };

    loadActivities();
  }, []);

  const handleAddActivity = async (activityData: Omit<Activity, 'id' | 'seniorInitials' | 'status' | 'type'>) => {
    const seniorData = seniors.find(s => s.name === activityData.senior);
    if (!seniorData) {
      throw new Error('Selected senior not found');
    }
    
    const newActivity = {
      ...activityData,
      type: 'visit' as Activity['type'], // Default type for API compatibility
      seniorInitials: seniorData.initials,
      status: 'pending' as const,
    };
    
    const newActivityItem = await mockApi.addActivity(newActivity);
    setActivities(prev => {
      const exists = prev.some(a => a.id === newActivityItem.id);
      if (exists) {
        console.warn('Activity already exists, skipping duplicate');
        return prev;
      }
      return [...prev, newActivityItem];
    });
  };

  const handleSubmit = async (activityData: Omit<Activity, 'id' | 'seniorInitials' | 'status' | 'type'>) => {
    await handleAddActivity(activityData);
  };

  const deleteActivity = async (id: number) => {
    try {
      await mockApi.deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const startEditActivity = (activity: Activity) => {
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const markAsCompleted = async (id: number) => {
    try {
      const activity = activities.find(a => a.id === id);
      if (activity) {
        const updatedActivity = await mockApi.updateActivity(id, { 
          ...activity, 
          status: 'completed' as const 
        });
        setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
      }
    } catch (error) {
      console.error('Error marking activity as completed:', error);
      // Fallback to local update if API fails
      setActivities(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'completed' as const } : a
      ));
    }
  };

  const upcomingActivities = activities.filter(a => ['pending', 'accepted'].includes(a.status));
  const rejectedActivities = activities.filter(a => a.status === 'rejected');
  const completedActivities = activities.filter(a => a.status === 'completed');
  const cancelledActivities = activities.filter(a => a.status === 'cancelled');

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
    </Box>
  );
};

export default Activities;
