import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Add,
  VideoCall,
  Phone,
  Coffee,
  FitnessCenter,
  MenuBook,
  Group,
  CalendarToday,
  AccessTime,
  Edit,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { mockApi, Activity, getSeniorsList } from '../../api/mockData';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

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

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [newActivity, setNewActivity] = useState({
    title: '',
    senior: '',
    date: '',
    time: '',
    type: 'video-call' as Activity['type'],
    description: '',
  });

  const activityIcons = {
    'video-call': VideoCall,
    'phone-call': Phone,
    'visit': Coffee,
    'exercise': FitnessCenter,
    'hobby': MenuBook,
    'social': Group,
  };

  const activityColors = {
    'video-call': { bg: '#e3f2fd', border: '#bbdefb', text: '#1976d2', icon: '#1976d2' },
    'phone-call': { bg: '#e8f5e8', border: '#c8e6c9', text: '#4caf50', icon: '#4caf50' },
    'visit': { bg: '#f3e5f5', border: '#e1bee7', text: '#7b1fa2', icon: '#7b1fa2' },
    'exercise': { bg: '#fff3e0', border: '#ffcc02', text: '#ff9800', icon: '#ff9800' },
    'hobby': { bg: '#fce4ec', border: '#f8bbd9', text: '#e91e63', icon: '#e91e63' },
    'social': { bg: '#e0f2f1', border: '#b2dfdb', text: '#00695c', icon: '#00695c' },
  };

  const seniors = getSeniorsList();

  const addActivity = async () => {
    if (newActivity.title && newActivity.senior && newActivity.date && newActivity.time) {
      try {
        const seniorData = seniors.find(s => s.name === newActivity.senior);
        const activityData = {
          ...newActivity,
          seniorInitials: seniorData?.initials || '',
          status: 'upcoming' as const,
        };
        
        const newActivityItem = await mockApi.addActivity(activityData);
        setActivities([...activities, newActivityItem]);
        setNewActivity({
          title: '',
          senior: '',
          date: '',
          time: '',
          type: 'video-call',
          description: '',
        });
        setIsAddingActivity(false);
      } catch (error) {
        console.error('Error adding activity:', error);
      }
    }
  };

  const deleteActivity = async (id: number) => {
    try {
      await mockApi.deleteActivity(id);
      setActivities(activities.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const startEditActivity = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setNewActivity({
      title: activity.title,
      senior: activity.senior,
      date: activity.date,
      time: activity.time,
      type: activity.type,
      description: activity.description,
    });
    setIsAddingActivity(true);
  };

  const updateActivity = async () => {
    if (editingActivityId && newActivity.title && newActivity.senior && newActivity.date && newActivity.time) {
      try {
        const seniorData = seniors.find(s => s.name === newActivity.senior);
        const updates = {
          ...newActivity,
          seniorInitials: seniorData?.initials || '',
        };

        const updatedActivity = await mockApi.updateActivity(editingActivityId, updates);
        setActivities(activities.map(activity => 
          activity.id === editingActivityId ? updatedActivity : activity
        ));
        
        setNewActivity({
          title: '',
          senior: '',
          date: '',
          time: '',
          type: 'video-call',
          description: '',
        });
        setEditingActivityId(null);
        setIsAddingActivity(false);
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  const cancelEdit = () => {
    setNewActivity({
      title: '',
      senior: '',
      date: '',
      time: '',
      type: 'video-call',
      description: '',
    });
    setEditingActivityId(null);
    setIsAddingActivity(false);
  };

  const markAsCompleted = (id: number) => {
    setActivities(activities.map(activity => 
      activity.id === id 
        ? { ...activity, status: 'completed' as const }
        : activity
    ));
  };

  const upcomingActivities = activities.filter(a => a.status === 'upcoming');
  const completedActivities = activities.filter(a => a.status === 'completed');

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      'video-call': 'Video Call',
      'phone-call': 'Phone Call',
      'visit': 'In-Person Visit',
      'exercise': 'Exercise',
      'hobby': 'Hobby/Activity',
    };
    return labels[type as keyof typeof labels] || type;
  };

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
            onClick={() => {
              if (!isAddingActivity || editingActivityId) {
                setEditingActivityId(null);
                setNewActivity({
                  title: '',
                  senior: '',
                  date: '',
                  time: '',
                  type: 'video-call',
                  description: '',
                });
              }
              setIsAddingActivity(!isAddingActivity);
            }}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Add Activity
          </Button>
        </Box>

        {/* Add/Edit Activity Form */}
        {isAddingActivity && (
          <Card sx={{ p: 4, mb: 6 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              {editingActivityId ? 'Edit Activity' : 'Schedule New Activity'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                label="Activity Title"
                placeholder="e.g., Weekly Video Call"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Senior</InputLabel>
                <Select
                  value={newActivity.senior}
                  onChange={(e) => setNewActivity({ ...newActivity, senior: e.target.value })}
                  label="Senior"
                >
                  {seniors.map((senior) => (
                    <MenuItem key={senior.name} value={senior.name}>
                      {senior.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                value={newActivity.date}
                onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Time"
                type="time"
                value={newActivity.time}
                onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as Activity['type'] })}
                  label="Activity Type"
                >
                  <MenuItem value="video-call">Video Call</MenuItem>
                  <MenuItem value="phone-call">Phone Call</MenuItem>
                  <MenuItem value="visit">In-Person Visit</MenuItem>
                  <MenuItem value="exercise">Exercise</MenuItem>
                  <MenuItem value="hobby">Hobby/Activity</MenuItem>
                  <MenuItem value="social">Social Event</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                placeholder="Add details about the activity..."
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                multiline
                rows={3}
                fullWidth
                sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={editingActivityId ? updateActivity : addActivity}
                sx={{ borderRadius: 2 }}
              >
                {editingActivityId ? 'Update Activity' : 'Schedule Activity'}
              </Button>
              <Button
                variant="outlined"
                onClick={cancelEdit}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
            </Box>
          </Card>
        )}

        {/* Upcoming Activities */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <CalendarToday sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Upcoming Activities ({upcomingActivities.length})
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {upcomingActivities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#6b7280' }}>No upcoming activities scheduled</Typography>
              </Box>
            ) : (
              upcomingActivities.map((activity) => {
                const Icon = activityIcons[activity.type];
                const colors = activityColors[activity.type];
                
                return (
                  <Paper
                    key={activity.id}
                    sx={{
                      p: 3,
                      bgcolor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      '&:hover': { boxShadow: 2 },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          border: `1px solid ${colors.border}`,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ color: colors.icon, fontSize: 24 }} />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {activity.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: 'white',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: colors.text,
                                }}
                              >
                                {activity.seniorInitials}
                              </Box>
                              <Typography sx={{ color: colors.text, fontWeight: 500 }}>
                                {activity.senior}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => markAsCompleted(activity.id)}
                              sx={{ color: '#4caf50', '&:hover': { bgcolor: '#e8f5e8' } }}
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => startEditActivity(activity)}
                              sx={{ color: '#1976d2', '&:hover': { bgcolor: '#e3f2fd' } }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteActivity(activity.id)}
                              sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ color: '#6b7280', fontSize: 16 }} />
                            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                              {new Date(activity.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ color: '#6b7280', fontSize: 16 }} />
                            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                              {activity.time}
                            </Typography>
                          </Box>
                          <Chip
                            label={getActivityTypeLabel(activity.type)}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}
                          />
                        </Box>
                        
                        {activity.description && (
                          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                            {activity.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </Card>

        {/* Completed Activities */}
        {completedActivities.length > 0 && (
          <Card sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recently Completed ({completedActivities.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {completedActivities.map((activity) => {
                const Icon = activityIcons[activity.type];
                
                return (
                  <Paper
                    key={activity.id}
                    sx={{
                      p: 3,
                      bgcolor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      opacity: 0.8,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: '#e0e0e0',
                          border: '1px solid #bdbdbd',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon sx={{ color: '#757575', fontSize: 24 }} />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#424242' }}>
                          {activity.title}
                        </Typography>
                        <Typography sx={{ color: '#757575', mb: 2 }}>
                          {activity.senior}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Typography sx={{ color: '#757575', fontSize: 14 }}>
                            {new Date(activity.date).toLocaleDateString()}
                          </Typography>
                          <Typography sx={{ color: '#757575', fontSize: 14 }}>
                            {activity.time}
                          </Typography>
                          <Chip
                            label={getActivityTypeLabel(activity.type)}
                            size="small"
                            sx={{ bgcolor: '#e0e0e0', color: '#757575' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Activities;
