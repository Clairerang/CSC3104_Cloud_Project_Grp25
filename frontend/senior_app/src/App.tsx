import React, { useState } from "react";
import { ThemeProvider, CssBaseline, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
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
import Layout from "./components/common/Layout";

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
      <Layout>
        {activeTab === "check-in" && <CheckInScreen onCheckIn={(m) => console.log("Checked in:", m)} />}
        {activeTab === "circle" && <CircleScreen contacts={contacts} />}
        {activeTab === "activities" && <ActivitiesScreen activities={activities} />}
        {activeTab === "progress" && <ProgressScreen weekDays={weekDays} checkIns={checkIns} />}
      </Layout>

      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          value={activeTab}
          onChange={(_, newValue: Tab) => setActiveTab(newValue)}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.8rem',
              fontWeight: 600,
            },
          }}
        >
          <BottomNavigationAction label="Check-In" value="check-in" icon={<HomeIcon />} />
          <BottomNavigationAction label="My Circle" value="circle" icon={<GroupIcon />} />
          <BottomNavigationAction label="Activities" value="activities" icon={<EmojiEventsIcon />} />
          <BottomNavigationAction label="Progress" value="progress" icon={<TrendingUpIcon />} />
        </BottomNavigation>
      </Paper>
    </ThemeProvider>
  );
};

export default App;
