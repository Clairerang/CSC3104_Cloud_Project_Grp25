import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Paper, Box, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import theme from "./theme/theme";
import { Tab, Contact, Activity } from "./types";
import CheckInScreen from "./components/checkin/CheckInScreen";
import CircleScreen from "./components/circle/CircleScreen";
import ActivitiesScreen from "./components/activities/ActivitiesScreen";
import ProgressScreen from "./components/progress/ProgressScreen";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("check-in");

  const contacts: Contact[] = [
    { id: "1", name: "Sarah", initials: "SJ", relationship: "Daughter", lastCall: "1 week ago", isFavorite: true },
    { id: "2", name: "Michael", initials: "MJ", relationship: "Son", lastCall: "1 week ago", isFavorite: true },
    { id: "3", name: "Emma", initials: "EJ", relationship: "Granddaughter", lastCall: "2 weeks ago", isFavorite: true },
    { id: "4", name: "Robert", initials: "RM", relationship: "Friend", lastCall: "1 week ago" },
    { id: "5", name: "Mary", initials: "MS", relationship: "Friend", lastCall: "1 week ago" },
    { id: "6", name: "David", initials: "DJ", relationship: "Brother", lastCall: "3 days ago" },
  ];

  const activities: Activity[] = [
    { id: "1", title: "Morning Stretch", description: "5 minutes of gentle stretching exercises", points: 10, category: "Exercise" },
    { id: "2", title: "Memory Quiz", description: "Complete today's brain teaser", points: 15, category: "Mental" },
    { id: "3", title: "Share a Recipe", description: "Post your favorite family recipe", points: 20, category: "Social" },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const checkIns = [true, true, true, true, true, false, false];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        {activeTab === "check-in" && <CheckInScreen onCheckIn={(m) => console.log("Checked in:", m)} />}
        {activeTab === "circle" && <CircleScreen contacts={contacts} />}
        {activeTab === "activities" && <ActivitiesScreen activities={activities} />}
        {activeTab === "progress" && <ProgressScreen weekDays={weekDays} checkIns={checkIns} />}

        {/* Bottom Navigation */}
        <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e7eb' }} elevation={0}>
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: '672px', mx: 'auto' }}>
              <Box
                onClick={() => setActiveTab('check-in')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: activeTab === 'check-in' ? '#ea580c' : '#9ca3af',
                }}
              >
                <HomeIcon sx={{ width: 28, height: 28 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                  Check-In
                </Typography>
              </Box>

              <Box
                onClick={() => setActiveTab('circle')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: activeTab === 'circle' ? '#2563eb' : '#9ca3af',
                }}
              >
                <GroupIcon sx={{ width: 28, height: 28 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                  My Circle
                </Typography>
              </Box>

              <Box
                onClick={() => setActiveTab('activities')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: activeTab === 'activities' ? '#7c3aed' : '#9ca3af',
                }}
              >
                <EmojiEventsIcon sx={{ width: 28, height: 28 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                  Activities
                </Typography>
              </Box>

              <Box
                onClick={() => setActiveTab('progress')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  color: activeTab === 'progress' ? '#0d9488' : '#9ca3af',
                }}
              >
                <TrendingUpIcon sx={{ width: 28, height: 28 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                  Progress
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;