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
  IconButton,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Delete,
  Phone,
  CheckCircle,
  Medication,
  Schedule,
  Notifications,
  AccessTime,
  Person,
  Group,
} from '@mui/icons-material';
import { mockApi, ReminderItem, getSeniorsList } from '../../api/mockData';

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

  const [newReminder, setNewReminder] = useState({
    title: '',
    senior: '',
    time: '',
    type: 'call' as ReminderItem['type'],
    description: '',
    frequency: 'once' as ReminderItem['frequency'],
  });

  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const seniors = getSeniorsList();

  const reminderIcons = {
    'call': Phone,
    'task': CheckCircle,
    'medication': Medication,
  };

  const reminderColors = {
    'call': { bg: '#e3f2fd', border: '#bbdefb', text: '#1976d2', icon: '#1976d2' },
    'task': { bg: '#e8f5e8', border: '#c8e6c9', text: '#4caf50', icon: '#4caf50' },
    'medication': { bg: '#fff3e0', border: '#ffcc02', text: '#ff9800', icon: '#ff9800' },
  };

  const frequencyLabels = {
    'once': 'Once',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
  };

  const addReminder = async () => {
    if (newReminder.title && newReminder.senior && newReminder.time) {
      try {
        const seniorData = seniors.find(s => s.name === newReminder.senior);
        const reminderData = {
          ...newReminder,
          seniorInitials: seniorData?.initials || '',
          isActive: true,
        };
        
        const newReminderItem = await mockApi.addReminderItem(reminderData);
        setReminders([...reminders, newReminderItem]);
        setNewReminder({
          title: '',
          senior: '',
          time: '',
          type: 'call',
          description: '',
          frequency: 'once',
        });
        setIsAddingReminder(false);
      } catch (error) {
        console.error('Error adding reminder:', error);
      }
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await mockApi.deleteReminderItem(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const toggleReminder = async (id: number) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        const updatedReminder = await mockApi.updateReminderItem(id, { isActive: !reminder.isActive });
        setReminders(reminders.map(r => r.id === id ? updatedReminder : r));
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const activeReminders = filteredReminders.filter(r => r.isActive);
  const inactiveReminders = filteredReminders.filter(r => !r.isActive);

  const getReminderTypeLabel = (type: string) => {
    const labels = {
      'call': '📞 Family Call',
      'task': '✅ Daily Task',
      'medication': '💊 Medication',
    };
    return labels[type as keyof typeof labels] || type;
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
        <Box sx={{ mb: 6 }}>
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

        {/* Add New Reminder Form */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Schedule New Reminder for Elderly
            </Typography>
            <Button
              variant={isAddingReminder ? "outlined" : "contained"}
              startIcon={<Add />}
              onClick={() => setIsAddingReminder(!isAddingReminder)}
              sx={{ borderRadius: 2 }}
            >
              {isAddingReminder ? 'Cancel' : 'Add Reminder'}
            </Button>
          </Box>

          {isAddingReminder && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
              <TextField
                label="Reminder Message for Elderly"
                placeholder="e.g., Take your morning medication"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Select Elderly Family Member</InputLabel>
                <Select
                  value={newReminder.senior}
                  onChange={(e) => setNewReminder({ ...newReminder, senior: e.target.value })}
                  label="Select Elderly Family Member"
                >
                  {seniors.map((senior) => (
                    <MenuItem key={senior.name} value={senior.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: '#1976d2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {senior.initials}
                        </Box>
                        {senior.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Time"
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Reminder Type</InputLabel>
                  <Select
                    value={newReminder.type}
                    onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as ReminderItem['type'] })}
                    label="Reminder Type"
                  >
                  <MenuItem value="call">📞 Family Call</MenuItem>
                  <MenuItem value="task">✅ Daily Task</MenuItem>
                  <MenuItem value="medication">💊 Medication</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                  <Select
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as ReminderItem['frequency'] })}
                    label="Frequency"
                  >
                  <MenuItem value="once">Once</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description (Optional)"
                placeholder="Additional details..."
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                fullWidth
                sx={{ gridColumn: { xs: '1', md: '1 / -1', lg: '1 / -1' } }}
              />
              <Box sx={{ display: 'flex', gap: 2, gridColumn: { xs: '1', md: '1 / -1', lg: '1 / -1' } }}>
                <Button
                  variant="contained"
                  onClick={addReminder}
                  sx={{ borderRadius: 2 }}
                >
                  Add Reminder
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setNewReminder({
                      title: '',
                      senior: '',
                      time: '',
                      type: 'call',
                      description: '',
                      frequency: 'once',
                    });
                    setIsAddingReminder(false);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {/* Preview Section */}
          {isAddingReminder && newReminder.title && newReminder.senior && newReminder.time && (
            <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                📱 Preview: How this reminder will appear on {newReminder.senior}'s phone
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 300,
                    height: 200,
                    bgcolor: '#1f2937',
                    borderRadius: 3,
                    p: 2,
                    position: 'relative',
                    boxShadow: 3,
                  }}
                >
                  {/* Phone Status Bar */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 600 }}>
                      {formatTime(newReminder.time)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ width: 4, height: 4, bgcolor: 'white', borderRadius: '50%' }} />
                      <Box sx={{ width: 4, height: 4, bgcolor: 'white', borderRadius: '50%' }} />
                      <Box sx={{ width: 4, height: 4, bgcolor: 'white', borderRadius: '50%' }} />
                    </Box>
                  </Box>

                  {/* Reminder Content */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      {newReminder.type === 'call' && <Phone sx={{ color: '#3b82f6', fontSize: 32 }} />}
                      {newReminder.type === 'task' && <CheckCircle sx={{ color: '#10b981', fontSize: 32 }} />}
                      {newReminder.type === 'medication' && <Medication sx={{ color: '#f59e0b', fontSize: 32 }} />}
                    </Box>
                    <Typography sx={{ color: 'white', fontSize: 16, fontWeight: 600, mb: 1 }}>
                      {newReminder.title}
                    </Typography>
                    <Typography sx={{ color: '#9ca3af', fontSize: 12, mb: 2 }}>
                      {frequencyLabels[newReminder.frequency]} • {newReminder.senior}
                    </Typography>
                    {newReminder.description && (
                      <Typography sx={{ color: '#d1d5db', fontSize: 11 }}>
                        {newReminder.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      sx={{
                        flex: 1,
                        bgcolor: '#ef4444',
                        color: 'white',
                        fontSize: 10,
                        py: 0.5,
                        '&:hover': { bgcolor: '#dc2626' },
                      }}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="small"
                      sx={{
                        flex: 1,
                        bgcolor: '#10b981',
                        color: 'white',
                        fontSize: 10,
                        py: 0.5,
                        '&:hover': { bgcolor: '#059669' },
                      }}
                    >
                      Mark Done
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Card>

        {/* Active Reminders */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Active Reminders for Elderly ({activeReminders.length})
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Elderly</InputLabel>
              <Select
                value={selectedElderlyFilter}
                onChange={(e) => setSelectedElderlyFilter(e.target.value)}
                label="Filter by Elderly"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Group sx={{ fontSize: 16, color: '#6b7280' }} />
                    All Elderly
                  </Box>
                </MenuItem>
                {seniors.map((senior) => (
                  <MenuItem key={senior.name} value={senior.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
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
                        {senior.initials}
                      </Box>
                      {senior.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeReminders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#6b7280', mb: 2 }}>
                  {selectedElderlyFilter === 'all' 
                    ? 'No active reminders' 
                    : `No active reminders for ${selectedElderlyFilter}`
                  }
                </Typography>
                {selectedElderlyFilter !== 'all' && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedElderlyFilter('all')}
                    sx={{ borderRadius: 2 }}
                  >
                    Clear Filter
                  </Button>
                )}
              </Box>
            ) : (
              activeReminders.map((reminder) => {
                const Icon = reminderIcons[reminder.type];
                const colors = reminderColors[reminder.type];
                
                return (
                  <Paper
                    key={reminder.id}
                    sx={{
                      p: 3,
                      bgcolor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 2,
                      '&:hover': { boxShadow: 2 },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                        {/* Elderly Name Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#1976d2',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {reminder.seniorInitials}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                            {reminder.senior}
                          </Typography>
                          <Chip
                            label="Elderly"
                            size="small"
                            sx={{
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              border: '1px solid #bbdefb',
                              fontSize: 10,
                              height: 20,
                            }}
                          />
                        </Box>
                        
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>
                          {reminder.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ color: colors.icon, fontSize: 16 }} />
                            <Typography sx={{ color: colors.text, fontWeight: 500 }}>
                              {formatTime(reminder.time)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={getReminderTypeLabel(reminder.type)}
                            size="small"
                            sx={{
                              bgcolor: colors.bg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}
                          />
                          <Chip
                            label={frequencyLabels[reminder.frequency]}
                            size="small"
                            sx={{
                              bgcolor: '#f3f4f6',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                            }}
                          />
                        </Box>
                        {reminder.description && (
                          <Typography sx={{ color: '#6b7280', fontSize: 14, mt: 1 }}>
                            {reminder.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleReminder(reminder.id)}
                          sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          <Schedule />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteReminder(reminder.id)}
                          sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </Card>

        {/* Inactive Reminders */}
        {inactiveReminders.length > 0 && (
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Inactive Reminders for Elderly ({inactiveReminders.length})
              </Typography>
              {selectedElderlyFilter !== 'all' && (
                <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                  Filtered by: {selectedElderlyFilter}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {inactiveReminders.map((reminder) => {
                const Icon = reminderIcons[reminder.type];
                
                return (
                  <Paper
                    key={reminder.id}
                    sx={{
                      p: 3,
                      bgcolor: '#f5f5f5',
                      border: '1px solid #673232ff',
                      borderRadius: 2,
                      opacity: 0.7,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                        {/* Elderly Name Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: '#9ca3af',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: 12,
                            }}
                          >
                            {reminder.seniorInitials}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#6b7280' }}>
                            {reminder.senior}
                          </Typography>
                          <Chip
                            label="Elderly"
                            size="small"
                            sx={{
                              bgcolor: '#f3f4f6',
                              color: '#6b7280',
                              border: '1px solid #d1d5db',
                              fontSize: 10,
                              height: 18,
                            }}
                          />
                        </Box>
                        
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#424242' }}>
                          {reminder.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography sx={{ color: '#757575' }}>
                            {formatTime(reminder.time)} • {getReminderTypeLabel(reminder.type)}
                          </Typography>
                        </Box>
                        {reminder.description && (
                          <Typography sx={{ color: '#757575', fontSize: 14 }}>
                            {reminder.description}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleReminder(reminder.id)}
                          sx={{ color: '#4caf50', '&:hover': { bgcolor: '#e8f5e8' } }}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteReminder(reminder.id)}
                          sx={{ color: '#f44336', '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          <Delete />
                        </IconButton>
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

export default Reminders;
