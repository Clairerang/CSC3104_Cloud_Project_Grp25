import React from "react";
import { Box, Typography, Card, Stack, Button } from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ keep Grid separate
import MicIcon from "@mui/icons-material/Mic";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import type { Contact } from "../../types";

interface Props {
  contacts: Contact[];
}

const CircleScreen: React.FC<Props> = ({ contacts }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "secondary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          ❤️
        </Box>
        <Typography variant="h4" color="primary.dark">
          My Loved Ones
        </Typography>
      </Stack>

      <Typography color="text.secondary" mb={2}>
        Tap anyone to connect
      </Typography>

      <Card
        sx={{
          p: 2,
          mb: 4,
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`,
          color: 'common.white',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography color="inherit">Say a name to call</Typography>
          <Button variant="contained" sx={{ borderRadius: "50%", minWidth: 48, bgcolor: 'common.white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
            <MicIcon fontSize="small" />
          </Button>
        </Stack>
      </Card>

      {/* Favorites */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}
        sx={{
          px: 1.5,
          py: 0.5,
          width: 'fit-content',
          borderRadius: 3,
          background: (t) => `linear-gradient(135deg, ${t.palette.warning.light}, ${t.palette.warning.main})`,
          color: 'common.white',
        }}
      >
        <StarIcon sx={{ color: 'inherit' }} />
        <Typography variant="subtitle1" color="inherit" fontWeight={600}>Favorites</Typography>
      </Stack>
      <Grid container spacing={2}>
        {contacts.filter(c => c.isFavorite).map(c => (
          <Grid item xs={4} key={c.id}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6">{c.initials}</Typography>
              <Typography>{c.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {c.relationship}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* All Contacts */}
      <Typography variant="h6" mt={4} mb={2}>
        All Contacts
      </Typography>
      <Stack spacing={2}>
        {contacts.filter(c => !c.isFavorite).map(c => (
          <Card key={c.id} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "grey.200",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {c.initials}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">{c.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {c.relationship}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Last call: {c.lastCall}
              </Typography>
            </Box>
            <Button variant="outlined" sx={{ borderRadius: "50%" }}>
              <PhoneIcon fontSize="small" />
            </Button>
          </Card>
        ))}
      </Stack>

      <Button
        variant="contained"
        color="error"
        fullWidth
        sx={{ mt: 4, py: 2, fontSize: "1.1rem", borderRadius: 3 }}
        startIcon={<PhoneIcon />}
      >
        Emergency: 911
      </Button>
    </Box>
  );
};

export default CircleScreen;
