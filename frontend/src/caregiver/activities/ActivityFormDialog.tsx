import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Activity } from '../api/mockData';

interface ActivityFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<Activity, 'id' | 'seniorInitials' | 'status' | 'type'>) => Promise<void>;
  seniors: Array<{ name: string; initials: string }>;
}

const ActivityFormDialog: React.FC<ActivityFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  seniors,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    senior: '',
    date: '',
    time: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when opening
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        senior: '',
        date: '',
        time: '',
        description: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required';
    }

    if (!formData.senior) {
      newErrors.senior = 'Please select a senior';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
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
      console.error('Error submitting activity:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      senior: '',
      date: '',
      time: '',
      description: '',
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
        Schedule New Activity
      </DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
          <TextField
            label="Activity Title"
            placeholder="e.g., Weekly Video Call"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />
          <FormControl fullWidth required error={!!errors.senior}>
            <InputLabel>Senior</InputLabel>
            <Select
              value={formData.senior}
              onChange={(e) => handleChange('senior', e.target.value)}
              label="Senior"
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
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
            fullWidth
            required
          />
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
          <TextField
            label="Description"
            placeholder="Add details about the activity..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
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
          {isSubmitting 
            ? 'Adding...' 
            : 'Schedule Activity'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityFormDialog;

