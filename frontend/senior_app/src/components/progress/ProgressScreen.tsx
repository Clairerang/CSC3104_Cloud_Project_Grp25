import React from "react";
import { Box, Typography, Card } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface Props {
  weekDays: string[];
  checkIns: boolean[];
}

const ProgressScreen: React.FC<Props> = ({ weekDays, checkIns }) => {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', pb: 20 }}>
      <Box sx={{ p: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
          <EmojiEventsIcon sx={{ width: 48, height: 48, color: '#0d9488' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f766e' }}>
              My Progress
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Track your wellness journey
            </Typography>
          </Box>
        </Box>

        {/* Check-ins Card */}
        <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 6, mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            This Week's Check-ins
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {weekDays.map((day, index) => (
              <Box key={day} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, color: '#6b7280', mb: 2 }}>
                  {day}
                </Typography>
                <Box sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: checkIns[index] ? '#16a34a' : 'transparent',
                  border: checkIns[index] ? 'none' : '2px dashed #d1d5db',
                  color: checkIns[index] ? 'white' : 'inherit',
                }}>
                  {checkIns[index] && <Typography sx={{ fontSize: 24 }}>✓</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, mb: 6 }}>
          <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 6 }}>
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: '#dcfce7',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}>
              <Typography sx={{ fontSize: 24 }}>✓</Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              5/7
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Check-ins This Week
            </Typography>
          </Card>

          <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 6 }}>
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: '#dbeafe',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}>
              <PhoneIcon sx={{ width: 24, height: 24, color: '#2563eb' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              8
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Calls Made
            </Typography>
          </Card>

          <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 6 }}>
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: '#faf5ff',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}>
              <EmojiEventsIcon sx={{ width: 24, height: 24, color: '#7c3aed' }} />
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              12
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Tasks Completed
            </Typography>
          </Card>

          <Card sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 1, p: 6 }}>
            <Box sx={{
              width: 48,
              height: 48,
              bgcolor: '#fff7ed',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}>
              <Typography sx={{ fontSize: 24 }}>📅</Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              23
            </Typography>
            <Typography sx={{ color: '#6b7280' }}>
              Active Days
            </Typography>
          </Card>
        </Box>

        {/* Achievements Card */}
        <Card sx={{ bgcolor: '#faf5ff', borderRadius: 4, p: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
            Achievements
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
            <Card sx={{
              bgcolor: 'white',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              border: '2px solid #eab308',
            }}>
              <Typography sx={{ fontSize: 36, mb: 2 }}>🔥</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                7 Day Streak
              </Typography>
            </Card>
            <Card sx={{
              bgcolor: 'white',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              border: '2px solid #eab308',
            }}>
              <Typography sx={{ fontSize: 36, mb: 2 }}>🎯</Typography>
              <Typography sx={{ fontWeight: 600 }}>
                Goal Achiever
              </Typography>
            </Card>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ProgressScreen;