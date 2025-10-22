import React, { useState } from "react";
import { Box, Button, Card, Typography, Stack } from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
import MicIcon from "@mui/icons-material/Mic";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import type { Mood } from "../../types";

interface Props {
  onCheckIn: (mood: Mood) => void;
}

const CheckInScreen: React.FC<Props> = ({ onCheckIn }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);

  return (
    <Box p={3}>
      <Card
        sx={{
          mb: 3,
          p: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 70%, ${theme.palette.warning.dark} 100%)`,
          color: 'common.white',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <WbSunnyIcon sx={{ fontSize: 40, color: "common.white" }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }} color="inherit">
                Good Morning!
              </Typography>
              <Typography color="inherit" sx={{ opacity: 0.9 }}>
                How are you feeling today?
              </Typography>
            </Box>
          </Stack>
          <CoffeeIcon sx={{ fontSize: 40, color: "common.white" }} />
        </Stack>
      </Card>

      <Card sx={{ p: 4, mb: 3 }}>
        <Typography align="center" color="text.secondary" mb={2}>
          Tap the microphone and tell me how you're doing
        </Typography>
        <Box textAlign="center">
          <Button
            sx={{ borderRadius: "50%", width: 96, height: 96 }}
            variant="contained"
            color="primary"
          >
            <MicIcon sx={{ fontSize: 40, color: "common.white" }} />
          </Button>
        </Box>
      </Card>

      <Stack spacing={2}>
        <Button
          variant={selectedMood === "great" ? "contained" : "outlined"}
          color="success"
          onClick={() => setSelectedMood("great")}
        >
          😊 Great!
        </Button>
        <Button
          variant={selectedMood === "okay" ? "contained" : "outlined"}
          color="warning"
          onClick={() => setSelectedMood("okay")}
        >
          😐 Okay
        </Button>
        <Button
          variant={selectedMood === "not-well" ? "contained" : "outlined"}
          color="error"
          onClick={() => setSelectedMood("not-well")}
        >
          ☹️ Not Well
        </Button>
      </Stack>

      <Button
        fullWidth
        sx={{ mt: 3 }}
        disabled={!selectedMood}
        variant="contained"
        color="success"
        onClick={() => onCheckIn(selectedMood)}
      >
        ✓ I'm Okay - Check In
      </Button>
    </Box>
  );
};

export default CheckInScreen;
