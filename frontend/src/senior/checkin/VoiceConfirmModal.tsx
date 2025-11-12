import React from "react";
import { Dialog, Box, Typography, Button, Stack } from "@mui/material";
import type { Mood } from "../../types";

interface Props {
  open: boolean;
  mood: Mood | null;
  transcript: string;
  onClose: () => void;
  onRecordAgain: () => void;
  onConfirm: () => void;
}

const VoiceConfirmModal: React.FC<Props> = ({
  open,
  mood,
  transcript,
  onClose,
  onRecordAgain,
  onConfirm,
}) => {
  const getMoodDisplay = () => {
    switch (mood) {
      case "great":
        return { emoji: "😊", text: "Great!", color: "#16a34a" };
      case "okay":
        return { emoji: "😐", text: "Okay", color: "#eab308" };
      case "not-well":
        return { emoji: "☹️", text: "Not Well", color: "#dc2626" };
      default:
        return { emoji: "❓", text: "Unknown", color: "#6b7280" };
    }
  };

  const moodDisplay = getMoodDisplay();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 4,
        },
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#1f2937" }}>
          Is this correct?
        </Typography>

        {/* Mood Display */}
        <Box
          sx={{
            width: 120,
            height: 120,
            bgcolor: `${moodDisplay.color}15`,
            border: `3px solid ${moodDisplay.color}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            mx: "auto",
            mb: 3,
          }}
        >
          {moodDisplay.emoji}
        </Box>

        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 600,
            color: moodDisplay.color,
            mb: 2,
          }}
        >
          {moodDisplay.text}
        </Typography>

        {/* Transcript */}
        {transcript && (
          <Box
            sx={{
              bgcolor: "#f3f4f6",
              borderRadius: 2,
              p: 2,
              mb: 4,
            }}
          >
            <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 1 }}>
              You said:
            </Typography>
            <Typography
              sx={{
                color: "#1f2937",
                fontSize: 16,
                fontStyle: "italic",
              }}
            >
              "{transcript}"
            </Typography>
          </Box>
        )}

        {/* Buttons */}
        <Stack spacing={2}>
          <Button
            onClick={onRecordAgain}
            sx={{
              width: "100%",
              p: 2.5,
              borderRadius: 3,
              bgcolor: "white",
              color: "#374151",
              fontSize: 18,
              fontWeight: 600,
              border: "2px solid #d1d5db",
              "&:hover": {
                bgcolor: "#f9fafb",
              },
            }}
          >
            🎤 Record Again
          </Button>

          <Button
            onClick={onConfirm}
            disabled={!mood}
            sx={{
              width: "100%",
              p: 2.5,
              borderRadius: 3,
              bgcolor: mood ? "#16a34a" : "#d1d5db",
              color: "white",
              fontSize: 18,
              fontWeight: 600,
              "&:hover": {
                bgcolor: mood ? "#15803d" : "#d1d5db",
              },
              "&:disabled": {
                bgcolor: "#d1d5db",
                color: "white",
              },
            }}
          >
            ✓ Confirm
          </Button>
        </Stack>

        {!mood && (
          <Typography
            sx={{
              mt: 3,
              color: "#dc2626",
              fontSize: 14,
            }}
          >
            Could not detect mood. Please record again or select manually.
          </Typography>
        )}
      </Box>
    </Dialog>
  );
};

export default VoiceConfirmModal;