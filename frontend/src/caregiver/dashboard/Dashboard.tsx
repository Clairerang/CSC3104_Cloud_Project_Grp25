import { Close, Timeline } from '@mui/icons-material';
import {
    Box,
    Card,
    Chip,
    CircularProgress,
    IconButton,
    LinearProgress,
    Alert as MuiAlert,
    Snackbar,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { caregiverApi, CaregiverSeniorItem, SeniorSummaryResponse, NotificationEvent } from '../api/client';
import { Alert } from '../api/mockData';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { CaregiverSeniorCard, SeniorStatus } from '../types/caregiver';
import SeniorDetailsDialog from './SeniorDetailsDialog';

const mapStatus = (summary: SeniorSummaryResponse, lastActiveAt: string | null): SeniorStatus => {
  if (summary.todayEngagements.some((engagement) => engagement.checkIn)) {
    return 'Active';
  }

  if (!lastActiveAt) {
    return 'Inactive';
  }

  const lastActive = new Date(lastActiveAt);
  const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

  if (hoursSinceActive <= 24) {
    return 'Missed Check-In';
  }

  return 'Inactive';
};

const formatLastActive = (lastActiveAt: string | null): string => {
  if (!lastActiveAt) return 'No check-ins yet';

  const lastActive = new Date(lastActiveAt);
  const diffMs = Date.now() - lastActive.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const computeEngagementScore = (totalPoints: number): number => {
  if (totalPoints <= 0) return 0;
  return Math.min(100, Math.round(totalPoints));
};

const getInitials = (name?: string, fallback?: string) => {
  const source = name || fallback || 'Senior';
  const matches = source.match(/\b\w/g);
  return matches ? matches.join('').slice(0, 2).toUpperCase() : source.slice(0, 2).toUpperCase();
};

const enrichSenior = (
  item: CaregiverSeniorItem,
  summary: SeniorSummaryResponse
): CaregiverSeniorCard => {
  const profile = item.senior.profile || {};
  const lastActiveAt = summary.lastActiveAt;

  return {
    id: item.seniorId,
    userId: item.seniorId,
    name: profile.name || item.senior.username,
    initials: getInitials(profile.name, item.senior.username),
    status: mapStatus(summary, lastActiveAt),
    lastCheckIn: formatLastActive(lastActiveAt),
    isOnline: !!(lastActiveAt && Date.now() - new Date(lastActiveAt).getTime() < 2 * 60 * 60 * 1000),
    engagement: computeEngagementScore(summary.totalPoints),
    relation: item.relation,
    email: profile.email,
    contact: profile.contact,
    totalPoints: summary.totalPoints,
    lastActiveAt,
    todayEngagements: summary.todayEngagements,
    latestMood: summary.todayEngagements.find((engagement) => engagement.mood)?.mood,
  };
};

const mapNotificationToAlert = (notification: NotificationEvent): Alert => {
  let message = '';
  let severity: 'high' | 'medium' | 'low' = 'low';

  const payload = notification.payload;
  const type = payload.type;

  // Map different notification types to user-friendly messages
  switch (type) {
    case 'urgent_wellbeing_alert':
      message = `${payload.userName || payload.seniorName || 'A senior'} is not feeling well and needs attention`;
      severity = 'high';
      break;
    case 'missed_checkin':
    case 'missed_checkin_alert':
      message = `${payload.seniorName || payload.userName || 'Senior'} has missed their check-in`;
      severity = 'high';
      break;
    case 'checkin':
      const mood = payload.mood === 'not-well' ? 'not feeling well' : payload.mood || 'checked in';
      message = `${payload.userName || payload.seniorName || 'Senior'} ${mood === 'checked in' ? mood : `is ${mood}`}`;
      severity = payload.mood === 'not-well' ? 'high' : 'low';
      break;
    case 'daily_login':
    case 'login':
    case 'senior_login_notification':
      message = `${payload.seniorName || payload.name || payload.userName || 'Senior'} logged in`;
      severity = 'low';
      break;
    case 'game_completed':
      const gameName = payload.gameName || 'a game';
      const points = payload.points ? ` and earned ${payload.points} points` : '';
      message = `${payload.userName || payload.seniorName || 'Senior'} completed ${gameName}${points}`;
      severity = 'low';
      break;
    default:
      message = payload.message || payload.body || `${type} event occurred`;
      severity = payload.severity as any || 'medium';
  }

  return {
    id: notification._id,
    message,
    severity,
  };
};

const Dashboard: React.FC = () => {
  const [seniors, setSeniors] = useState<CaregiverSeniorCard[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSenior, setSelectedSenior] = useState<CaregiverSeniorCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingSeniors, setLoadingSeniors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadSeniors = useCallback(async () => {
    setLoadingSeniors(true);
    setError(null);
    try {
      const response = await caregiverApi.getSeniors();
      const enriched = await Promise.all(
        response.seniors.map(async (item) => {
          const summary = await caregiverApi.getSeniorSummary(item.seniorId);
          return enrichSenior(item, summary);
        })
      );
      setSeniors(enriched);
    } catch (err) {
      console.error('Error loading caregiver seniors:', err);
      setError('Unable to load linked seniors. Please try again later.');
      setSeniors([]);
    } finally {
      setLoadingSeniors(false);
    }
  }, []);

  // Real-time updates via MQTT
  useRealtimeUpdates({
    enabled: true,
    onEvent: (event) => {
      console.log('📬 Dashboard received event:', event.type);

      // Show notification
      if (event.type === 'checkin') {
        setNotification(`Check-in: ${event.session} session completed`);
      } else if (event.type === 'game_completed') {
        setNotification(`${event.gameName}: +${event.points} points`);
      } else if (event.type === 'login') {
        setNotification(`${event.name || event.username} has logged in`);
      }

      // Refresh senior data
      loadSeniors();
    },
  });

  const loadAlerts = useCallback(async () => {
    try {
      const response = await caregiverApi.getNotifications(50, 1);
      console.log('[Dashboard] Raw notifications:', response);

      const mappedAlerts = response.items
        .filter(notification => {
          const type = notification.payload?.type;
          if (!type) return false;

          // Show high-priority alerts and important notifications
          const isAlert = [
            'urgent_wellbeing_alert',
            'missed_checkin',
            'missed_checkin_alert'  // Backend actually publishes this
          ].includes(type);

          const isBadMood = type === 'checkin' && notification.payload.mood === 'not-well';

          // Show game completions and check-ins as notifications (not just bad moods)
          const isEngagement = ['game_completed', 'checkin', 'senior_login_notification', 'login'].includes(type);

          return isAlert || isBadMood || isEngagement;
        })
        .map(mapNotificationToAlert)
        .slice(0, 15); // Show more items

      console.log('[Dashboard] Filtered alerts:', mappedAlerts);
      setAlerts(mappedAlerts);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    loadSeniors();
  }, [loadSeniors, loadAlerts]);

  const dismissAlert = async (id: string) => {
    // For now, just remove from local state
    // TODO: Add API endpoint to mark notification as read/dismissed
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleSeniorClick = (senior: CaregiverSeniorCard) => {
    setSelectedSenior(senior);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Missed Check-In':
        return 'warning';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return '#4caf50';
    if (engagement >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f9fafb' }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#111827' }}>
            Senior Care Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            Monitor and manage care for your loved ones
          </Typography>
        </Box>

        {/* Senior Overview Cards */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: '#111827' }}>
            Senior Overview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {loadingSeniors ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <MuiAlert severity="error">{error}</MuiAlert>
            ) : seniors.length === 0 ? (
              <MuiAlert severity="info">No seniors are linked to this caregiver yet.</MuiAlert>
            ) : (
              seniors.map((senior) => (
                <Box key={senior.id}>
                  <Card
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleSeniorClick(senior)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: '#1976d2',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: 16,
                            }}
                          >
                            {senior.initials}
                          </Box>
                          {senior.isOnline && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: '#4caf50',
                                borderRadius: '50%',
                                border: '2px solid white',
                              }}
                            />
                          )}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 0.5 }}>
                            {senior.name}
                          </Typography>
                          <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
                            Last activity: {senior.lastCheckIn}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                            Relation: {senior.relation}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      label={senior.status}
                      color={getStatusColor(senior.status) as any}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Card>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Engagement Chart */}
        <Card sx={{ p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Timeline sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Weekly Check-In Overview
            </Typography>
          </Box>
          {loadingSeniors ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : seniors.length === 0 ? (
            <Typography sx={{ color: '#6b7280' }}>
              Link a senior account to see their engagement trends.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {seniors.map((senior) => (
                <Box key={senior.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {senior.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {senior.engagement}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={senior.engagement}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getEngagementColor(senior.engagement),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Card>


        {/* Alerts */}
        <Card sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Alerts & Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert) => (
              <Box
                key={alert.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: getSeverityColor(alert.severity) === 'error' ? '#f44336' : 
                               getSeverityColor(alert.severity) === 'warning' ? '#ff9800' : '#2196f3',
                  bgcolor: getSeverityColor(alert.severity) === 'error' ? '#ffebee' : 
                           getSeverityColor(alert.severity) === 'warning' ? '#fff3e0' : '#e3f2fd',
                  position: 'relative',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => dismissAlert(alert.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#6b7280',
                  }}
                >
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography sx={{ fontSize: 14, pr: 3 }}>
                  {alert.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Senior Detail Dialog */}
        <SeniorDetailsDialog
          senior={selectedSenior}
          open={isDialogOpen}
          onClose={handleCloseDialog}
        />
      </Box>

      {/* Real-time notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        message={notification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Box>
  );
};

export default Dashboard;