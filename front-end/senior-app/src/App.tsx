import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Paper, Box, Typography, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PhoneIcon from "@mui/icons-material/Phone";

import theme from "./theme/theme";
import { Tab, Contact, Activity } from "./types";
import CheckInScreen from "./components/checkin/CheckInScreen";
import CircleScreen from "./components/circle/CircleScreen";
import ActivitiesScreen from "./components/activities/ActivitiesScreen";
import { MorningStretch } from "./components/games/MorningStretch";
import { MemoryQuiz } from "./components/games/MemoryQuiz";
import { CulturalTrivia } from "./components/games/CulturalTrivia";
import { ShareRecipe } from "./components/games/ShareRecipe";
import { StackTower } from "./components/games/StackTower";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("check-in");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(850); // Initialize with starting points

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Sarah", initials: "SJ", relationship: "Daughter", lastCall: "1 week ago", isFavorite: true, number: '+65 12345678' },
    { id: "2", name: "Michael", initials: "MJ", relationship: "Son", lastCall: "1 week ago", isFavorite: true, number: '+65 78945612' },
    { id: "3", name: "Emma", initials: "EJ", relationship: "Granddaughter", lastCall: "2 weeks ago", isFavorite: true, number: '+65 98765421' },
    { id: "4", name: "Robert", initials: "RM", relationship: "Friend", lastCall: "1 week ago", number: '+65 36925814' },
    { id: "5", name: "Mary", initials: "MS", relationship: "Friend", lastCall: "1 week ago", number: '+65 85274163' },
    { id: "6", name: "David", initials: "DJ", relationship: "Brother", lastCall: "3 days ago", number: '+65 65498721' },
  ]);

  const activities: Activity[] = [
    { id: "1", title: "Morning Stretch", description: "5 gentle stretching exercises", points: 10, category: "Exercise" },
    { id: "2", title: "Memory Quiz", description: "Complete today's brain teaser", points: 15, category: "Mental" },
    { id: "3", title: "Cultural Trivia", description: "Answer 3 questions about local history", points: 15, category: "Learning" },
    { id: "4", title: "Share a Recipe", description: "Post your favorite family recipe", points: 20, category: "Social" },
    { id: "5", title: "Stack Tower", description: "Stack blocks perfectly to build a tall tower!", points: 20, category: "Casual"},
  ];

  const handleEmergencyCall = () => {
    console.log("Emergency call initiated");
  };

  const handlePlayGame = (activityId: string) => {
    setActiveGame(activityId);
    console.log("Playing game:", activityId);
  };

  const handleBackToActivities = () => {
    setActiveGame(null);
  };

  const handleGameComplete = () => {
    // Find the completed activity and add its points
    const completedActivity = activities.find(a => a.id === activeGame);
    if (completedActivity) {
      setTotalPoints(prevPoints => prevPoints + completedActivity.points);
      console.log(`Game completed! Added ${completedActivity.points} points`);
    }
    
    setActiveGame(null);
    setActiveTab("activities");
  };

const handleAddContact = (newContact: Omit<Contact, "id">) => {
  const contact: Contact = {
    ...newContact,
    id: Date.now().toString(), // Generate unique ID using timestamp
  };
  setContacts([...contacts, contact]);
};

const handleEditContact = (updatedContact: Contact) => {
  setContacts(contacts.map(c => 
    c.id === updatedContact.id ? updatedContact : c
  ));
};

const handleDeleteContact = (contactToDelete: Contact) => {
  setContacts(contacts.filter(c => c.id !== contactToDelete.id));
};

  // If a game is active, show the game screen
  if (activeGame) {
    const getGameComponent = () => {
      switch (activeGame) {
        case "1":
          return <MorningStretch onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "2":
          return <MemoryQuiz onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "3":
          return <CulturalTrivia onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "4":
          return <ShareRecipe onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "5":
          return <StackTower onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        default:
          return null;
      }
    };

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
          {getGameComponent()}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        {activeTab === "check-in" && <CheckInScreen onCheckIn={(m) => console.log("Checked in:", m)} />}
        {activeTab === "circle" && <CircleScreen contacts={contacts} onAddContact={handleAddContact} onEditContact={handleEditContact} onDeleteContact={handleDeleteContact} />}
        {activeTab === "activities" && (
          <ActivitiesScreen 
            activities={activities} 
            onPlayGame={handlePlayGame}
            totalPoints={totalPoints}
          />
        )}

        {/* Floating Emergency Button */}
        <Button
          onClick={handleEmergencyCall}
          sx={{
            position: 'fixed',
            top: 24,
            right: 24,
            bgcolor: '#dc2626',
            color: 'white',
            px: 4,
            py: 2,
            borderRadius: 3,
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            '&:hover': { 
              bgcolor: '#b91c1c',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <PhoneIcon sx={{ width: 20, height: 20 }} />
          Emergency: 911
        </Button>

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
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;