import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PeopleIcon from "@mui/icons-material/People";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TriviaIcon from "@mui/icons-material/Quiz";
import StarIcon from "@mui/icons-material/Star";
import TowerIcon from "@mui/icons-material/TableRows";
import { Alert, Box, Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { Activity } from "../../types";
import { ScheduledActivity, seniorApi } from "../api/client";

interface Props {
  activities: Activity[];
  onPlayGame: (activityId: string) => void;
  totalPoints: number;
  levelData: any; // Level data from backend
}

// compute the starting points required for a given level (level start)
// level 1 starts at 0, level 2 starts at 100, level 3 at 210, etc.
// sum of increments: 100,110,120,...
const thresholdForLevel = (level: number) => {
  if (level <= 1) return 0;
  const n = level - 1; // number of increments before this level
  // sum = n*100 + 10 * sum_{i=0..n-1} i = 100*n + 10*(n*(n-1)/2) = 100*n + 5*n*(n-1)
  return 100 * n + 5 * n * (n - 1);
};

// derive current level from totalPoints: level 1 = 0..99, level 2 = 100..209, etc.
const getLevel = (totalPoints: number) => {
  let level = 1;
  // advance while next level threshold has been reached
  while (totalPoints >= thresholdForLevel(level + 1)) {
    level += 1;
  }
  return level;
};

// return level info including progress toward next level
const getLevelInfo = (totalPoints: number) => {
  const level = getLevel(totalPoints);
  const min = thresholdForLevel(level);
  const next = thresholdForLevel(level + 1);
  const gap = next - min;
  const progress = gap > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalPoints - min) / gap) * 100))) 
    : 100;
  const progressValue = Math.max(0, totalPoints - min);
  const toNextLevel = gap - progressValue;
  return { level, min, next, gap, progress, progressValue, toNextLevel };
};

const ActivitiesScreen: React.FC<Props> = ({ activities, onPlayGame, totalPoints, levelData }) => {
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  // Fetch scheduled activities from caregivers
  useEffect(() => {
    const fetchScheduledActivities = async () => {
      try {
        setLoadingActivities(true);
        const data = await seniorApi.getActivities();
        setScheduledActivities(data);
        setActivitiesError(null);
      } catch (error) {
        console.error('Error fetching scheduled activities:', error);
        setActivitiesError('Failed to load scheduled activities');
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchScheduledActivities();
  }, []);

  const handleAcceptActivity = async (activityId: string) => {
    try {
      await seniorApi.updateActivityStatus(activityId, 'accepted');
      setScheduledActivities(scheduledActivities.map(activity =>
        activity.activityId === activityId ? { ...activity, status: 'accepted' } : activity
      ));
    } catch (error) {
      console.error('Error accepting activity:', error);
    }
  };

  const handleRejectActivity = async (activityId: string) => {
    try {
      await seniorApi.updateActivityStatus(activityId, 'rejected');
      setScheduledActivities(scheduledActivities.map(activity =>
        activity.activityId === activityId ? { ...activity, status: 'rejected' } : activity
      ));
    } catch (error) {
      console.error('Error rejecting activity:', error);
    }
  };

  // Use backend level data if available, otherwise calculate locally as fallback
  const levelInfo = levelData ? {
    level: levelData.level,
    progress: levelData.progress.percent,
    toNextLevel: levelData.progress.xpToNextLevel,
    progressValue: levelData.progress.currentXP,
  } : getLevelInfo(totalPoints);
  
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box sx={{
            width: 48,
            height: 48,
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 50,
          }}>
            🎯
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#7c3aed' }}>
              Activities
            </Typography>
          </Box>
        </Box>

        {/* Scheduled Activities from Caregivers */}
        <Card sx={{ bgcolor: 'white', borderRadius: 1, p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              bgcolor: '#dbeafe',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 24 }}>📅</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Scheduled Activities
            </Typography>
          </Box>

          {loadingActivities ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : activitiesError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {activitiesError}
            </Alert>
          ) : scheduledActivities.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#9ca3af',
            }}>
              <Typography sx={{ fontSize: 16 }}>
                No scheduled activities
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {scheduledActivities.map((activity) => (
                <Card key={activity.id} sx={{
                  bgcolor: activity.status === 'accepted' ? '#f0fdf4' :
                          activity.status === 'completed' ? '#eff6ff' :
                          activity.status === 'rejected' ? '#fef2f2' : '#fef3f2',
                  borderRadius: 1,
                  p: 3,
                  border: activity.status === 'accepted' ? '1px solid #86efac' :
                          activity.status === 'completed' ? '1px solid #93c5fd' :
                          activity.status === 'rejected' ? '1px solid #fecaca' : '1px solid #fecaca'
                }}>
                  <Box sx={{ display: 'flex', gap: 3}}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: 24 }}>
                        {activity.type === 'video-call' ? '📹' :
                         activity.type === 'phone-call' ? '📞' :
                         activity.type === 'visit' ? '🏠' :
                         activity.type === 'exercise' ? '🏃' :
                         activity.type === 'hobby' ? '🎨' : '🤝'}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 18, color: '#3b82f6', fontWeight: 600, mb: 1 }}>
                        From {activity.caregiver}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                          {activity.title}
                        </Typography>
                        {activity.status === 'accepted' && (
                          <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#16a34a', fontStyle: 'italic' }}>
                            - Accepted
                          </Typography>
                        )}
                        {activity.status === 'completed' && (
                          <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#2563eb', fontStyle: 'italic' }}>
                            - Completed
                          </Typography>
                        )}
                        {activity.status === 'rejected' && (
                          <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#dc2626', fontStyle: 'italic' }}>
                            - Declined
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 16 }}>📅</Typography>
                          <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                            {new Date(activity.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 16 }}>🕐</Typography>
                          <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                      {activity.description && (
                        <Box sx={{
                          bgcolor: 'white',
                          borderRadius: 1,
                          p: 1.5,
                          mb: 3,
                        }}>
                          <Typography sx={{ fontSize: 16, color: '#6b7280', fontStyle: 'italic' }}>
                            "{activity.description}"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  {activity.status === 'pending' ? (
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box
                        onClick={() => handleAcceptActivity(activity.activityId)}
                        sx={{
                          flex: 1,
                          py: 1,
                          bgcolor: '#22c55e',
                          borderRadius: 1,
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          '&:hover': { bgcolor: '#16a34a' }
                        }}
                      >
                        <Typography sx={{ fontSize: 20, color: 'white' }}>✓</Typography>
                        <Typography sx={{ fontWeight: 600, color: 'white', fontSize: 16 }}>Accept</Typography>
                      </Box>
                      <Box
                        onClick={() => handleRejectActivity(activity.activityId)}
                        sx={{
                          flex: 1,
                          py: 1,
                          bgcolor: '#ef4444',
                          borderRadius: 1,
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          '&:hover': { bgcolor: '#dc2626' }
                        }}
                      >
                        <Typography sx={{ fontSize: 20, color: 'white' }}>✕</Typography>
                        <Typography sx={{ fontWeight: 600, color: 'white', fontSize: 16 }}>Decline</Typography>
                      </Box>
                    </Box>
                  ) : activity.status === 'accepted' ? (
                    <Box sx={{
                      bgcolor: '#dcfce7',
                      borderRadius: 1,
                      py: 1,
                      textAlign: 'center',
                      border: '2px solid #16a34a',
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#16a34a', fontSize: 16 }}>
                        ✓ You've accepted this activity
                      </Typography>
                    </Box>
                  ) : activity.status === 'completed' ? (
                    <Box sx={{
                      bgcolor: '#dbeafe',
                      borderRadius: 1,
                      py: 1,
                      textAlign: 'center',
                      border: '2px solid #2563eb',
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#2563eb', fontSize: 16 }}>
                        ✓ This activity has been completed
                      </Typography>
                    </Box>
                  ) : activity.status === 'rejected' ? (
                    <Box sx={{
                      bgcolor: '#fee2e2',
                      borderRadius: 1,
                      py: 1,
                      textAlign: 'center',
                      border: '2px solid #dc2626',
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#dc2626', fontSize: 16 }}>
                        ✕ You've declined this activity
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{
                      bgcolor: '#fef3c7',
                      borderRadius: 1,
                      py: 1,
                      textAlign: 'center',
                      border: '2px solid #f59e0b',
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#f59e0b', fontSize: 16 }}>
                        Status: {activity.status}
                      </Typography>
                    </Box>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </Card>

        {/* Points Card - Now uses totalPoints prop */}
        <Card sx={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 2,
          p: 4,
          mb: 6,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ color: '#374151', mb: 2, fontSize: 20 }}>
                Your Total Points
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon sx={{ width: 32, height: 32, color: '#ea580c' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalPoints}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Box sx={{
                  bgcolor: '#7c3aed',
                  color: 'white',
                  px: 4,
                  py: 1,
                  borderRadius: '20px',
                  fontSize: 16,
                  fontWeight: 600,
                  mb: 1,
                }}>
                  Level {levelInfo.level}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ea580c' }}>
                  <Typography sx={{ fontSize: 24 }}>🔥</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {levelData?.latestStreak || 0} Day{levelData?.latestStreak !== 1 ? 's' : ''}
                  </Typography>
                </Box>
            </Box>
          </Box>
          <Box>
            <Box sx={{
              width: '100%',
              height: 12,
              bgcolor: '#d1d5db',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <Box sx={{ width: `${levelInfo.progress}%`, height: '100%', bgcolor: '#f97316' }} />
            </Box>
            <Box sx={{ display: 'flex', right: 0, justifyContent: 'flex-end' , mt: 2 }}>
              <Typography sx={{ fontSize: 18, textAlign: 'right' }}>
                {levelInfo.toNextLevel} points to next level
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Activities List */}
        <Stack spacing={4}>
          {activities.map(activity => (
            <Card
              key={activity.id}
              sx={{
                borderRadius: 1,
                p: 4,
                bgcolor: activity.category === 'Exercise' ? '#f0fdf4' :
                         activity.category === 'Mental' ? '#faf5ff' : 
                         activity.category === 'Learning' ? '#fef1e1ff' :
                         activity.category === 'Casual' ? '#deeeffff' : '#fdfbeaff',     
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, mb: 4 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'white',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activity.category === 'Exercise' ? (
                  <FitnessCenterIcon sx={{ width: 24, height: 24, color: '#16a34a' }} />
                ) : activity.category === 'Mental' ? (
                  <PsychologyIcon sx={{ width: 24, height: 24, color: '#7c3aed' }} />
                ) : activity.category === 'Learning' ? (
                  <PeopleIcon sx={{ width: 24, height: 24, color: '#ea580c' }} />
                ) : activity.category === 'Casual' ? (
                  <TowerIcon sx={{ width: 24, height: 24, color: '#3389ebff' }} />
                ) : (
                  <TriviaIcon sx={{ width: 24, height: 24, color: '#e0d790ff' }} />
                )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {activity.title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', mb: 2 }}>
                    {activity.description}
                  </Typography>
                  <Typography sx={{
                    display: 'inline-block',
                    bgcolor: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: '20px',
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {activity.category}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 18, fontWeight: 700 }}>
                  ⚡ {activity.points}
                </Box>
              </Box>
              <Button 
                onClick={() => onPlayGame(activity.id)}
                sx={{
                  width: '100%',
                  bgcolor: '#49bd74ff',
                  color: 'white',
                  py: 1,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#15803d' },
                  fontSize: 20,
                }}
              >
                Play Game
              </Button>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default ActivitiesScreen;