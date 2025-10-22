import React from "react";
import { Box, Typography, Card, Button } from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid separate
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
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <StarIcon sx={{ fontSize: 32, color: "warning.main" }} />
        <Box>
          <Typography variant="h4" color="secondary.main">
            Daily Activities
          </Typography>
          <Typography color="text.secondary">
            Keep your mind and body active
          </Typography>
        </Box>
      </Box>

      <Card
        sx={{
          p: 3,
          mb: 4,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 60%, ${theme.palette.warning.dark} 100%)`,
          color: 'common.white',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography color="text.secondary">Your Total Points</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <StarIcon sx={{ fontSize: 24, color: "warning.main" }} />
              <Typography variant="h4" fontWeight="bold">
                850
              </Typography>
            </Box>
          </Box>
          <Box textAlign="right">
            <Box
              sx={{
                bgcolor: "secondary.main",
                color: "common.white",
                px: 2,
                py: 0.5,
                borderRadius: "20px",
                fontSize: "0.8rem",
                mb: 1,
              }}
            >
              Level 12
            </Box>
            <Typography color="inherit" fontWeight="bold">
              🔥 7 Days
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">Today's Progress</Typography>
            <Typography variant="body2">0/60 points</Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: 10,
              bgcolor: 'rgba(255,255,255,0.4)',
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Box sx={{ width: "0%", height: "100%", bgcolor: "common.white" }} />
          </Box>
        </Box>
      </Card>

      <Grid container spacing={2}>
        {activities.map((activity) => (
          <Grid item xs={12} key={activity.id}>
            <Card
              sx={{
                p: 3,
                bgcolor:
                  activity.category === "Exercise"
                    ? "success.light"
                    : activity.category === "Mental"
                    ? "secondary.light"
                    : "warning.light",
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "white",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activity.category === "Exercise" ? (
                    <FitnessCenterIcon color="success" />
                  ) : activity.category === "Mental" ? (
                    <PsychologyIcon color="secondary" />
                  ) : (
                    <PeopleIcon color="warning" />
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6">{activity.title}</Typography>
                  <Typography color="text.secondary" mb={1}>
                    {activity.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "inline-block",
                      bgcolor: "white",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {activity.category}
                  </Typography>
                </Box>
                <Typography fontWeight="bold" color="warning.main">
                  ⚡ {activity.points}
                </Typography>
              </Box>
              <Button variant="contained" fullWidth color="success">
                ✓ Complete Task
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ActivitiesScreen;
