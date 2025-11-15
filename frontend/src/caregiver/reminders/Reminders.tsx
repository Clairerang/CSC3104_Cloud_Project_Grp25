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
import caregiverApi, { ReminderItem } from '../api/client';
import ReminderFormDialog from './ReminderFormDialog';
import ReminderListSection from './ReminderListSection';

interface Senior {
  id: string;
  name: string;
  initials: string;
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<ReminderItem[]>([]);
  const [seniors, setSeniors] = useState<Senior[]>([]);
  const [selectedElderlyFilter, setSelectedElderlyFilter] = useState<string>('all');
  const [isAddingReminder, setIsAddingReminder] = useState(false);
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
        const [remindersResponse, seniorsResponse] = await Promise.all([
          caregiverApi.getReminders(),
          caregiverApi.getSeniors(),
        ]);
        
        setReminders(remindersResponse.reminders);
        setFilteredReminders(remindersResponse.reminders);
        
        const seniorsList = seniorsResponse.seniors.map(item => ({
          id: item.seniorId,
          name: item.senior.profile?.name || item.senior.username,
          initials: item.senior.profile?.name
            ? item.senior.profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'UK',
        }));
        setSeniors(seniorsList);
      } catch (err) {
        console.error('Error loading reminders:', err);
        setError('Failed to load reminders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter reminders by elderly
  useEffect(() => {
    if (selectedElderlyFilter === 'all') {
      setFilteredReminders(reminders);
    } else {
      setFilteredReminders(reminders.filter(reminder => reminder.senior === selectedElderlyFilter));
    }
  }, [selectedElderlyFilter, reminders]);

  const frequencyLabels = {
    'once': 'Once',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
  };

  const handleAddReminder = async (reminderData: { senior: string; title: string; time: string; type: string; description?: string; frequency: string }) => {
    const seniorData = seniors.find(s => s.name === reminderData.senior);
    if (!seniorData) {
      throw new Error('Selected elderly family member not found');
    }
    
    try {
      const response = await caregiverApi.createReminder({
        seniorId: seniorData.id,
        title: reminderData.title,
        description: reminderData.description,
        time: reminderData.time,
        type: reminderData.type,
        frequency: reminderData.frequency,
      });
      
      setReminders(prev => [...prev, response.reminder]);
      setSnackbar({ open: true, message: 'Reminder created successfully', severity: 'success' });
      setIsAddingReminder(false);
    } catch (err) {
      console.error('Error creating reminder:', err);
      setSnackbar({ open: true, message: 'Failed to create reminder', severity: 'error' });
      throw err;
    }
  };

  const deleteReminder = async (id: string | number) => {
    try {
      await caregiverApi.deleteReminder(String(id));
      setReminders(prev => prev.filter(r => r.id !== id && r.reminderId !== id));
      setSnackbar({ open: true, message: 'Reminder deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setSnackbar({ open: true, message: 'Failed to delete reminder', severity: 'error' });
    }
  };



  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
              Senior Reminder Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280' }}>
              Schedule and manage reminders for your elderly 
              {selectedElderlyFilter !== 'all' && (
                <Box component="span" sx={{ ml: 2, display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: '#1976d2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    {seniors.find(s => s.name === selectedElderlyFilter)?.initials}
                  </Box>
                  <Typography component="span" sx={{ color: '#1976d2', fontWeight: 500 }}>
                    Filtered by: {selectedElderlyFilter}
                  </Typography>
                </Box>
              )}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsAddingReminder(true)}
            sx={{ borderRadius: 2, px: 3, py: 1.5 }}
          >
            Schedule New Reminder for Elderly
          </Button>
        </Box>

        {/* Add New Reminder Dialog */}
        <ReminderFormDialog
          open={isAddingReminder}
          onClose={() => setIsAddingReminder(false)}
          onSubmit={handleAddReminder}
          seniors={seniors}
          frequencyLabels={frequencyLabels}
        />

        {/* Reminders */}
        <ReminderListSection
          title="Reminders for Elderly"
          reminders={filteredReminders}
          isActive={true}
          onDelete={deleteReminder}
          formatTime={formatTime}
          frequencyLabels={frequencyLabels}
          selectedElderlyFilter={selectedElderlyFilter}
          onFilterChange={setSelectedElderlyFilter}
          seniors={seniors}
          showFilter={true}
        />
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

export default Reminders;
