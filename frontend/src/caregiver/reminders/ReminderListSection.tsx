import React from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Notifications, Group } from '@mui/icons-material';
import { ReminderItem } from '../api/mockData';
import ReminderCard from './ReminderCard';

interface ReminderListSectionProps {
  title: string;
  reminders: ReminderItem[];
  isActive: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  formatTime: (time: string) => string;
  frequencyLabels: Record<string, string>;
  selectedElderlyFilter: string;
  onFilterChange: (value: string) => void;
  seniors: Array<{ name: string; initials: string }>;
  showFilter?: boolean;
}

const ReminderListSection: React.FC<ReminderListSectionProps> = ({
  title,
  reminders,
  isActive,
  onToggle,
  onDelete,
  formatTime,
  frequencyLabels,
  selectedElderlyFilter,
  onFilterChange,
  seniors,
  showFilter = false,
}) => {
  if (!isActive && reminders.length === 0) {
    return null;
  }

  return (
    <Card sx={{ p: 4, mb: isActive ? 6 : 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isActive && <Notifications sx={{ color: '#1976d2' }} />}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title} ({reminders.length})
          </Typography>
        </Box>
        {showFilter && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Elderly</InputLabel>
            <Select
              value={selectedElderlyFilter}
              onChange={(e) => onFilterChange(e.target.value)}
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
        )}
        {!isActive && selectedElderlyFilter !== 'all' && (
          <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
            Filtered by: {selectedElderlyFilter}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {reminders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: '#6b7280', mb: 2 }}>
              {selectedElderlyFilter === 'all' 
                ? `No ${isActive ? 'active' : 'inactive'} reminders` 
                : `No ${isActive ? 'active' : 'inactive'} reminders for ${selectedElderlyFilter}`
              }
            </Typography>
            {selectedElderlyFilter !== 'all' && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onFilterChange('all')}
                sx={{ borderRadius: 2 }}
              >
                Clear Filter
              </Button>
            )}
          </Box>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              isActive={isActive}
              onToggle={onToggle}
              onDelete={onDelete}
              formatTime={formatTime}
              frequencyLabels={frequencyLabels}
            />
          ))
        )}
      </Box>
    </Card>
  );
};

export default ReminderListSection;

