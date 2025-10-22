import React from "react";
import { Box, Typography, Card, Button, Stack } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PeopleIcon from "@mui/icons-material/People";
import type { Activity } from "../../types";

interface Props {
  activities: Activity[];
}

const ActivitiesScreen: React.FC<Props> = ({ activities }) => {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
          <StarIcon sx={{ width: 48, height: 48, color: '#eab308' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#7c3aed' }}>
              Daily Activities
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Keep your mind and body active
            </Typography>
          </Box>
        </Box>

        {/* Points Card */}
        <Card sx={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: 4,
          p: 6,
          mb: 6,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography sx={{ color: '#374151', mb: 2 }}>
                Your Total Points
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon sx={{ width: 32, height: 32, color: '#ea580c' }} />
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  850
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
                fontSize: 14,
                fontWeight: 600,
                mb: 2,
              }}>
                Level 12
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
              <Typography sx={{ fontSize: 14 }}>Today's Progress</Typography>
              <Typography sx={{ fontSize: 14 }}>0/60 points</Typography>
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
                borderRadius: 4,
                p: 6,
                bgcolor: activity.category === 'Exercise' ? '#f0fdf4' :
                         activity.category === 'Mental' ? '#faf5ff' : '#fff7ed',
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
                  ) : (
                    <PeopleIcon sx={{ width: 24, height: 24, color: '#ea580c' }} />
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
              <Button sx={{
                width: '100%',
                bgcolor: '#16a34a',
                color: 'white',
                py: 3,
                borderRadius: 3,
                fontWeight: 600,
                '&:hover': { bgcolor: '#15803d' },
              }}>
                ✓ Complete Task
              </Button>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default ActivitiesScreen;