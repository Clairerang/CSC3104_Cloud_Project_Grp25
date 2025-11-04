import React, { useState } from "react";
import { Box, Typography, Card, Button, Stack } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TriviaIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import TowerIcon from "@mui/icons-material/TableRows";
import type { Activity } from "../../types";

interface Props {
  activities: Activity[];
  onPlayGame: (activityId: string) => void;
  totalPoints: number; // Add this prop
}

interface Invitation {
  id: string;
  from: string;
  title: string;
  date: string;
  time: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
}

const ActivitiesScreen: React.FC<Props> = ({ activities, onPlayGame, totalPoints }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "1",
      from: "Sarah",
      title: "Family Dinner",
      date: "Saturday, Oct 26",
      time: "6:00 PM",
      message: "Hi Mom! Would love to have dinner together this Saturday. Miss you! ❤️",
      status: 'pending',
    },
    {
      id: "2",
      from: "Michael",
      title: "Doctor Appointment",
      date: "Monday, Oct 28",
      time: "10:00 AM",
      message: "Scheduled your checkup with Dr. Lee. I will pick you up at 9:30 AM.",
      status: 'pending',
    },
  ]);

  const handleAccept = (invitationId: string) => {
    setInvitations(invitations.map(inv => 
      inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
    ));
  };

  const handleDecline = (invitationId: string) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
  };

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

        {/* Family Invitations Card */}
        <Card sx={{ bgcolor: 'white', borderRadius: 1, p: 4, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{
              width: 40,
              height: 40,
              bgcolor: '#fef3c7',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 24 }}>📨</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Family Invitations
            </Typography>
          </Box>

          {invitations.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#9ca3af',
            }}>
              <Typography sx={{ fontSize: 16 }}>
                No pending invitations
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {invitations.map((invitation) => (
                <Card key={invitation.id} sx={{ bgcolor: '#fef3f2', borderRadius: 1, p: 3, border: '1px solid #fecaca' }}>
                  <Box sx={{ display: 'flex', gap: 3}}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#ddd6fe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: 24 }}>👤</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 18, color: '#a855f7', fontWeight: 600, mb: 1 }}>
                        From {invitation.from}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                          {invitation.title}
                        </Typography>
                        {invitation.status === 'accepted' && (
                          <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#1edc63ff', fontStyle: 'italic' }}>
                            - Accepted
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 16 }}>📅</Typography>
                          <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                            {invitation.date}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: 16 }}>🕐</Typography>
                          <Typography sx={{ fontSize: 16, color: '#6b7280' }}>
                            {invitation.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        p: 1.5,
                        mb: 3,
                      }}>
                        <Typography sx={{ fontSize: 16, color: '#6b7280', fontStyle: 'italic' }}>
                          "{invitation.message}"
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {invitation.status === 'pending' ? (
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box 
                        onClick={() => handleAccept(invitation.id)}
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
                        onClick={() => handleDecline(invitation.id)}
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
                  ) : (
                    <Box sx={{
                      bgcolor: '#dcfce7',
                      borderRadius: 1,
                      py: 1,
                      textAlign: 'center',
                      border: '2px solid #16a34a',
                    }}>
                      <Typography sx={{ fontWeight: 600, color: '#16a34a', fontSize: 16 }}>
                        ✓ You've accepted this invitation
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
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
                mb: 2,
              }}>
                Level {Math.floor(totalPoints / 100) + 1}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ea580c' }}>
                <Typography sx={{ fontSize: 24 }}>🔥</Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  7 Days
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: 18 }}>Today's Progress</Typography>
            </Box>
            <Box sx={{
              width: '100%',
              height: 12,
              bgcolor: '#d1d5db',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              <Box sx={{ width: '0%', height: '100%', bgcolor: '#16a34a' }} />
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
                  ) : activity.category === 'Social' ? (
                    <PeopleIcon sx={{ width: 24, height: 24, color: '#cab202ff' }} />
                  ) : activity.category === 'Learning' ? (
                    <TriviaIcon sx={{ width: 24, height: 24, color: '#ea580c' }} />
                  ) : (
                    <TowerIcon sx={{ width: 24, height: 24, color: '#3389ebff' }} />
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