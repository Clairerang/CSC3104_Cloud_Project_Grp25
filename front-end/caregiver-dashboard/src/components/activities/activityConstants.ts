import {
  VideoCall,
  Phone,
  Coffee,
  FitnessCenter,
  MenuBook,
  Group,
} from '@mui/icons-material';
import { Activity } from '../../api/mockData';

export const activityIcons = {
  'video-call': VideoCall,
  'phone-call': Phone,
  'visit': Coffee,
  'exercise': FitnessCenter,
  'hobby': MenuBook,
  'social': Group,
};

export const activityColors = {
  'video-call': { bg: '#e3f2fd', border: '#bbdefb', text: '#1976d2', icon: '#1976d2' },
  'phone-call': { bg: '#e8f5e8', border: '#c8e6c9', text: '#4caf50', icon: '#4caf50' },
  'visit': { bg: '#f3e5f5', border: '#e1bee7', text: '#7b1fa2', icon: '#7b1fa2' },
  'exercise': { bg: '#fff3e0', border: '#ffcc02', text: '#ff9800', icon: '#ff9800' },
  'hobby': { bg: '#fce4ec', border: '#f8bbd9', text: '#e91e63', icon: '#e91e63' },
  'social': { bg: '#e0f2f1', border: '#b2dfdb', text: '#00695c', icon: '#00695c' },
};

export const getActivityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'video-call': 'Video Call',
    'phone-call': 'Phone Call',
    'visit': 'In-Person Visit',
    'exercise': 'Exercise',
    'hobby': 'Hobby/Activity',
    'social': 'Social Event',
  };
  return labels[type] || type;
};

export const activityTypes: Activity['type'][] = [
  'video-call',
  'phone-call',
  'visit',
  'exercise',
  'hobby',
  'social',
];

