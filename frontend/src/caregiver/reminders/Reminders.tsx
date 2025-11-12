import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';
import { mockApi, ReminderItem, getSeniorsList } from '../api/mockData';
import ReminderFormDialog from './ReminderFormDialog';
import ReminderListSection from './ReminderListSection';

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<ReminderItem[]>([]);
  const [selectedElderlyFilter, setSelectedElderlyFilter] = useState<string>('all');

  // Load data from API
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const remindersData = await mockApi.getReminderItems();
        setReminders(remindersData);
        setFilteredReminders(remindersData);
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };

    loadReminders();
  }, []);

  // Filter reminders by elderly
  useEffect(() => {
    if (selectedElderlyFilter === 'all') {
      setFilteredReminders(reminders);
    } else {
      setFilteredReminders(reminders.filter(reminder => reminder.senior === selectedElderlyFilter));
    }
  }, [selectedElderlyFilter, reminders]);

  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const seniors = getSeniorsList();

  const frequencyLabels = {
    'once': 'Once',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
  };

  const handleAddReminder = async (reminderData: Omit<ReminderItem, 'id' | 'seniorInitials' | 'isActive'>) => {
    const seniorData = seniors.find(s => s.name === reminderData.senior);
    if (!seniorData) {
      throw new Error('Selected elderly family member not found');
    }
    
    const newReminder = {
      ...reminderData,
      seniorInitials: seniorData.initials,
      isActive: true,
    };
    
    const newReminderItem = await mockApi.addReminderItem(newReminder);
    
    // Use functional update to avoid race conditions and duplicates
    setReminders(prev => {
      // Check if reminder already exists (defensive check)
      const exists = prev.some(r => r.id === newReminderItem.id);
      if (exists) {
        console.warn('Reminder already exists, skipping duplicate');
        return prev;
      }
      return [...prev, newReminderItem];
    });
    
    setIsAddingReminder(false);
  };

  const deleteReminder = async (id: number) => {
    try {
      await mockApi.deleteReminderItem(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };



  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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
    </Box>
  );
};

export default Reminders;
