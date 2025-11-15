import EndCallIcon from "@mui/icons-material/CallEnd";
import CommentIcon from '@mui/icons-material/Comment';
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import ChatModal from "./chat/ChatModal";

import { registerPush } from "../push/registerPush";
import { Activity, Contact } from "../types";
import ActivitiesScreen from "./activities/ActivitiesScreen";
import seniorApi, { CaregiverContact } from "./api/client";
import CheckInScreen from "./checkin/CheckInScreen";
import CircleScreen from "./circle/CircleScreen";
import { NotificationItem, NotificationPanel } from "./components/NotificationPanel";
import { CulturalTrivia } from "./games/CulturalTrivia";
import { MemoryQuiz } from "./games/MemoryQuiz";
import { MorningStretch } from "./games/MorningStretch";
import { ShareRecipe } from "./games/ShareRecipe";
import { StackTower } from "./games/StackTower";


type Tab = "check-in" | "circle" | "activities";

// Map game types from DB to local IDs for routing
const GAME_TYPE_TO_ID: { [key: string]: string } = {
  'stretch': '1',
  'memory': '2',
  'trivia': '3',
  'recipe': '4',
  'tower': '5',
};

const SeniorApp: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("check-in");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0); // Start at 0, will fetch from backend
  const [levelData, setLevelData] = useState<any>(null); // Store complete level data from backend
  const [activities, setActivities] = useState<Activity[]>([]);

  // New state for emergency modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);

  // Notification panel state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const stored = localStorage.getItem('senior_notifications');
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch total points and level data from backend
  const fetchTotalPoints = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/total-points', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTotalPoints(data.totalPoints || 0);
        setLevelData({
          level: data.level,
          progress: data.progress,
          latestStreak: data.latestStreak
        });
        console.log(`[POINTS] Fetched: ${data.totalPoints} points, Level ${data.level}, ${data.latestStreak}-day streak`);
      }
    } catch (error) {
      console.error('Error fetching total points:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to convert API caregiver data to Contact format
  const caregiverToContact = (caregiver: CaregiverContact): Contact => {
    const getInitials = (name: string) => {
      const matches = name.match(/\b\w/g);
      return matches ? matches.join('').slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase();
    };

    return {
      id: caregiver.caregiverId,
      name: caregiver.name,
      initials: getInitials(caregiver.name),
      relationship: caregiver.relation,
      lastCall: "Not available", // This would need to be tracked separately
      isFavorite: false, // Could be added as a user preference later
      phoneNumber: caregiver.contact || 'Not provided',
    };
  };

  const [contacts, setContacts] = useState<Contact[]>([]);

  // Fetch activities and total points from database
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/games/games');
        const data = await response.json();

        if (data.success && data.games) {
          // Map database games to Activity format
          const mappedActivities: Activity[] = data.games.map((game: any) => {
            const localId = GAME_TYPE_TO_ID[game.type] || game.gameId;

            // Map game types to categories
            const categoryMap: { [key: string]: string } = {
              'stretch': 'Exercise',
              'memory': 'Mental',
              'trivia': 'Learning',
              'recipe': 'Social',
              'tower': 'Casual',
            };

            return {
              id: localId,
              title: game.name,
              description: game.description,
              points: game.points,
              category: categoryMap[game.type] || 'Learning',
            };
          });

          setActivities(mappedActivities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to basic activities if fetch fails
        setActivities([
          { id: "1", title: "Morning Stretch", description: "5 gentle stretching exercises", points: 10, category: "Exercise" },
          { id: "2", title: "Memory Quiz", description: "Complete today's brain teaser", points: 15, category: "Mental" },
          { id: "3", title: "Cultural Trivia", description: "Answer questions about history", points: 15, category: "Learning" },
          { id: "5", title: "Stack Tower", description: "Stack blocks perfectly to build a tall tower!", points: 20, category: "Casual"},
        ]);
      }
    };

    fetchActivities();
    fetchTotalPoints(); // Fetch total points on component mount
  }, []);

  // Fetch contacts (caregivers/family) from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const caregivers = await seniorApi.getCaregivers();
        const mappedContacts = caregivers.map(caregiverToContact);
        setContacts(mappedContacts);
        console.log('[Senior App] Fetched contacts:', mappedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        // Keep contacts as empty array if fetch fails
      }
    };

    fetchContacts();
  }, []);

  // Register for push notifications once user is known (senior app scope)
  useEffect(() => {
    if (user?.id) {
      console.log('[Senior App] Registering push notifications for user:', user.id);
      registerPush(user.id, (notification) => {
        console.log('[Senior App] Notification received via callback:', notification);
        // Add to in-app notification panel
        const newNotif: NotificationItem = {
          id: Date.now().toString(),
          title: notification.title,
          body: notification.body,
          timestamp: Date.now(),
          read: false
        };
        setNotifications(prev => {
          const updated = [newNotif, ...prev].slice(0, 50); // Keep max 50
          localStorage.setItem('senior_notifications', JSON.stringify(updated));
          console.log('[Senior App] Notification added to panel. Total notifications:', updated.length);
          return updated;
        });
      }).catch(err => {
        console.warn('[Senior App] FCM registration failed, but UI will still work:', err);
      });

      // DEV: Add a test notification to verify UI works
      if (process.env.NODE_ENV === 'development') {
        console.log('[Senior App] Development mode: Adding test notification in 3 seconds');
        setTimeout(() => {
          const testNotif: NotificationItem = {
            id: 'test-' + Date.now(),
            title: 'Test Reminder',
            body: 'This is a test reminder to verify the notification panel works!',
            timestamp: Date.now(),
            read: false
          };
          setNotifications(prev => {
            const updated = [testNotif, ...prev];
            localStorage.setItem('senior_notifications', JSON.stringify(updated));
            return updated;
          });
        }, 3000);
      }
    }
  }, [user?.id]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('senior_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.removeItem('senior_notifications');
  };

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

  const handleGameComplete = async () => {
    const completedActivity = activities.find(a => a.id === activeGame);
    if (completedActivity) {
      console.log(`Game completed! Points will be updated from backend`);
    }

    setActiveGame(null);
    setActiveTab("activities");

    // Fetch updated points from backend after game completion
    // Wait 2 seconds for backend to process, then retry if needed
    const refreshPoints = async (attempt = 1) => {
      const oldPoints = totalPoints;
      await fetchTotalPoints();

      // If points haven't updated and we haven't tried 3 times, retry after 1 second
      if (totalPoints === oldPoints && attempt < 3) {
        console.log(`[POINTS] Retry ${attempt + 1}: Points not updated yet, retrying...`);
        setTimeout(() => refreshPoints(attempt + 1), 1000);
      }
    };

    setTimeout(() => refreshPoints(), 2000);
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

// New helpers to open/close emergency modal
const openEmergencyModal = () => {
  // store any required context here if needed later
  setShowEmergencyModal(true);
  console.log("Navigating to emergency modal");
};

const closeEmergencyModal = () => {
  setShowEmergencyModal(false);
  console.log("Ending emergency call");
};

  // If a game is active, show the game screen
  if (activeGame) {
    // Map activity IDs to gameIds from the database
    const gameIdMap: { [key: string]: string } = {
      "1": "stretch-001",
      "2": "memory-001",
      "3": "trivia-001",
      "4": "recipe-001",
      "5": "tower-001"
    };

    const gameId = gameIdMap[activeGame];
    const userId = user?.id || '';

    const getGameComponent = () => {
      switch (activeGame) {
        case "1":
          return <MorningStretch userId={userId} gameId={gameId} onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "2":
          return <MemoryQuiz userId={userId} gameId={gameId} onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "3":
          return <CulturalTrivia userId={userId} gameId={gameId} onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "4":
          return <ShareRecipe userId={userId} gameId={gameId} onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        case "5":
          return <StackTower userId={userId} gameId={gameId} onBack={handleBackToActivities} onComplete={handleGameComplete} />;
        default:
          return null;
      }
    };

    return (
      <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'white',
            borderBottom: '1px solid #e5e7eb',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 999,
          }}
        >
          <Box
            component="img"
            src="/app-icon.jpg"
            alt="Senior Care Logo"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              Senior Care
            </Typography>
          </Box>

          {/* Emergency 911 button */}
          <Box sx={{ flex: 1 }} />

          {/* Notification Bell */}
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAll}
          />

          <Button
            onClick={() => { openEmergencyModal(); handleEmergencyCall(); }}
            startIcon={<PhoneIcon sx={{ width: 20, height: 20 }} />}
            sx={{
              bgcolor: '#dc2626',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 3px 5px rgba(0,0,0,0.12)',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#b91c1c',
              },
            }}
          >
            Emergency: 911
          </Button>
        </Box>

        {/* Add padding to account for fixed header */}
        <Box sx={{ pt: '72px' }} />

        {getGameComponent()}

        {/* Logout Button - Bottom Left */}
        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon sx={{ width: 24, height: 24 }} />}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            bgcolor: '#6b7280',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 3,
            fontSize: 18,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#4b5563',
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          Logout
        </Button>

        {/* Emergency Modal */}
        <Modal
          open={showEmergencyModal}
          onClose={closeEmergencyModal}
          aria-labelledby="emergency-modal-title"
          aria-describedby="emergency-modal-description"
        >
          <Box
            sx={{
              position: 'absolute' as const,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              width: 600,
              height: 420,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center',
            }}
          >
            <Typography id="emergency-modal-title" variant="h6" sx={{ mb: 2 }}>
              Dialling 911...
            </Typography>
            <Typography id="emergency-modal-description" sx={{ mb: 3 }}>
              Please wait while the call connects.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>              
              <Button
                onClick={closeEmergencyModal}
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' },
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EndCallIcon sx={{ width: 30, height: 30 }} />
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          borderBottom: '1px solid #e5e7eb',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          zIndex: 999,
        }}
      >
        <Box
          component="img"
          src="/app-icon.jpg"
          alt="Senior Care Logo"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            objectFit: 'cover',
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            Senior Care
          </Typography>
        </Box>

        {/* Emergency 911 button */}
        <Box sx={{ flex: 1 }} />

        {/* Notification Bell */}
        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAll}
        />

        <Button
          onClick={() => { openEmergencyModal(); handleEmergencyCall(); }}
          startIcon={<PhoneIcon sx={{ width: 20, height: 20 }} />}
          sx={{
            bgcolor: '#dc2626',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 3px 5px rgba(0,0,0,0.12)',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#b91c1c',
            },
          }}
        >
          Emergency: 911
        </Button>
      </Box>

      {/* Add padding to account for fixed header */}
      <Box sx={{ pt: '72px' }} />

      {activeTab === "check-in" && <CheckInScreen onCheckIn={(m) => console.log("Checked in:", m)} />}
      {activeTab === "circle" && <CircleScreen contacts={contacts} onAddContact={handleAddContact} onEditContact={handleEditContact} onDeleteContact={handleDeleteContact}  />}
      {activeTab === "activities" && (
        <ActivitiesScreen
          activities={activities}
          onPlayGame={handlePlayGame}
          totalPoints={totalPoints}
          levelData={levelData}
        />
      )}


      {/* Logout Button - Bottom Left */}
      <Button
        onClick={handleLogout}
        startIcon={<LogoutIcon sx={{ width: 24, height: 24 }} />}
        sx={{
          position: 'fixed',
          bottom: 110,
          left: 24,
          bgcolor: '#6b7280',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: 3,
          fontSize: 18,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          textTransform: 'none',
          '&:hover': {
            bgcolor: '#4b5563',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
          },
        }}
      >
        Logout
      </Button>

      {/* Chat bot */}
      <Button
        aria-label="open-messages"
        onClick={() => setChatOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 110,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: '#0ea5a4',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          zIndex: 1000,
          '&:hover': {
            bgcolor: '#028489',
            boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
          },
          textTransform: 'none',
        }}
      >
        <CommentIcon sx={{ width: 28, height: 28 }} />
      </Button>

      {/* Chat Modal */}
      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userId={user?.id || 'guest-user'}
      />

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

      {/* Emergency Modal (also present when not in a game) */}
      <Modal
        open={showEmergencyModal}
        onClose={closeEmergencyModal}
        aria-labelledby="emergency-modal-title"
        aria-describedby="emergency-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 600,
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'center',
          }}
        >
          <Typography id="emergency-modal-title" variant="h6" sx={{ mb: 2 }}>
            Dialling 911...
          </Typography>
          <Typography id="emergency-modal-description" sx={{ mb: 3 }}>
            Please wait while the call connects.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>              
              <Button
                onClick={closeEmergencyModal}
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  bgcolor: '#ef4444',
                  '&:hover': { bgcolor: '#dc2626' },
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EndCallIcon sx={{ width: 30, height: 30 }} />
              </Button>
            </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SeniorApp;
