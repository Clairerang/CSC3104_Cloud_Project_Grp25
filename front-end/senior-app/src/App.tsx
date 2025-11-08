import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";

import theme from "./theme/theme";
import { Tab, Contact, Activity } from "./types";

import CheckInScreen from "./pages/CheckInScreen";
import CircleScreen from "./pages/CircleScreen";
import ActivitiesScreen from "./pages/ActivitiesScreen";
import { MorningStretch } from "./pages/MorningStretch";
import { MemoryQuiz } from "./pages/MemoryQuiz";
import { CulturalTrivia } from "./pages/CulturalTrivia";
import { ShareRecipe } from "./pages/ShareRecipe";
import { StackTower } from "./pages/StackTower";

const API_BASE_URL = process.env.REACT_APP_API_GATEWAY || "http://localhost:8083";

const App: React.FC = () => {
  // ✅ ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  
  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  
  // App state
  const [activeTab, setActiveTab] = useState<Tab>("check-in");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(850);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Sarah", initials: "SJ", relationship: "Daughter", lastCall: "1 week ago", isFavorite: true, phoneNumber: "+65 12345678" },
    { id: "2", name: "Michael", initials: "MJ", relationship: "Son", lastCall: "1 week ago", isFavorite: true, phoneNumber: "+65 78945612" },
    { id: "3", name: "Emma", initials: "EJ", relationship: "Granddaughter", lastCall: "2 weeks ago", isFavorite: true, phoneNumber: "+65 98765421" },
    { id: "4", name: "Robert", initials: "RM", relationship: "Friend", lastCall: "1 week ago", phoneNumber: "+65 36925814" },
    { id: "5", name: "Mary", initials: "MS", relationship: "Friend", lastCall: "1 week ago", phoneNumber: "+65 85274163" },
    { id: "6", name: "David", initials: "DJ", relationship: "Brother", lastCall: "3 days ago", phoneNumber: "+65 65498721" },
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);

  // Auth check effect
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/"; // your login route
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Fetch activities effect
  useEffect(() => {
    if (!authChecked) return; // Don't fetch until auth is checked
    
    const load = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${API_BASE_URL}/api/games`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success && res.data?.games) {
          setActivities(
            res.data.games.map((game: any) => ({
              id: game.gameId,
              title: game.name,
              description: game.description,
              points: game.points,
              category:
                game.type === "stretch" ? "Exercise" :
                game.type === "memory"  ? "Mental"   :
                game.type === "trivia"  ? "Learning" : "Casual",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };
    load();
  }, [authChecked]);

  // ✅ NOW SAFE TO RETURN EARLY - ALL HOOKS HAVE BEEN CALLED
  if (!authChecked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading…
        </Box>
      </ThemeProvider>
    );
  }

  // Handlers
  const handleCheckIn = (mood: string | null) => {
    console.log("Checked in with mood:", mood);
  };

  const handleAddContact = (newContact: Omit<Contact, "id">) => {
    const contact: Contact = { ...newContact, id: String(Date.now()) };
    setContacts(prev => [...prev, contact]);
  };

  const handleEditContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteContact = (toDelete: Contact) => {
    setContacts(prev => prev.filter(c => c.id !== toDelete.id));
  };

  // Game flow
  const handlePlayGame = (id: string) => setActiveGame(id);
  const handleBack = () => setActiveGame(null);
  const handleGameComplete = () => {
    const activity = activities.find(a => a.id === activeGame);
    if (activity) setTotalPoints(p => p + activity.points);
    setActiveGame(null);
    setActiveTab("activities");
  };

  const renderGameScreen = () => {
    switch (activeGame) {
      case "1": return <MorningStretch onBack={handleBack} onComplete={handleGameComplete} />;
      case "2": return <MemoryQuiz onBack={handleBack} onComplete={handleGameComplete} />;
      case "3": return <CulturalTrivia onBack={handleBack} onComplete={handleGameComplete} />;
      case "4": return <ShareRecipe onBack={handleBack} onComplete={handleGameComplete} />;
      case "5": return <StackTower onBack={handleBack} onComplete={handleGameComplete} />;
      default:  return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", bgcolor: "#f9fafb" }}>

        {/* GAME MODE */}
        {activeGame && renderGameScreen()}

        {/* MAIN MODE */}
        {!activeGame && (
          <>
            {activeTab === "check-in" && <CheckInScreen onCheckIn={handleCheckIn} />}

            {activeTab === "circle" && (
              <CircleScreen
                contacts={contacts}
                onAddContact={handleAddContact}
                onEditContact={handleEditContact}
                onDeleteContact={handleDeleteContact}
              />
            )}

            {activeTab === "activities" && (
              <ActivitiesScreen
                activities={activities}
                onPlayGame={handlePlayGame}
                totalPoints={totalPoints}
              />
            )}

            <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
              <Box sx={{ display: "flex", justifyContent: "space-around", p: 2 }}>
                <Box onClick={() => setActiveTab("check-in")}><HomeIcon /></Box>
                <Box onClick={() => setActiveTab("circle")}><GroupIcon /></Box>
                <Box onClick={() => setActiveTab("activities")}><EmojiEventsIcon /></Box>
              </Box>
            </Paper>
          </>
        )}

      </Box>
    </ThemeProvider>
  );
};

export default App;