import React from 'react';
import {
  Box,
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
  Alert,
  CircularProgress,
} from '@mui/material';
import { ReminderItem } from '../api/mockData';

interface ReminderFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reminder: Omit<ReminderItem, 'id' | 'seniorInitials' | 'isActive'>) => Promise<void>;
  seniors: Array<{ name: string; initials: string }>;
  frequencyLabels: Record<string, string>;
}

const ReminderFormDialog: React.FC<ReminderFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  seniors,
  frequencyLabels,
}) => {
  const [formData, setFormData] = React.useState({
    title: '',
    senior: '',
    time: '',
    type: 'call' as ReminderItem['type'],
    description: '',
    frequency: 'once' as ReminderItem['frequency'],
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const validateTime = (time: string): boolean => {
    // Time should be in HH:MM format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Reminder message is required';
    }

    if (!formData.senior) {
      newErrors.senior = 'Please select an elderly family member';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (!validateTime(formData.time)) {
      newErrors.time = 'Please enter a valid time (HH:MM format)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting reminder:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to add reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      senior: '',
      time: '',
      type: 'call',
      description: '',
      frequency: 'once',
    });
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20 }}>
        Schedule New Reminder for Elderly
      </DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
          <TextField
            label="Reminder Message for Elderly"
            placeholder="e.g., Take your morning medication"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />
          <FormControl fullWidth required error={!!errors.senior}>
            <InputLabel>Select Elderly Family Member</InputLabel>
            <Select
              value={formData.senior}
              onChange={(e) => handleChange('senior', e.target.value)}
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
            {errors.senior && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {errors.senior}
              </Box>
            )}
          </FormControl>
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.time}
            helperText={errors.time}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
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
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ borderRadius: 2 }}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Adding...' : 'Add Reminder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderFormDialog;

