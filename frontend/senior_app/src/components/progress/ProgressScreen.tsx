import React from "react";
import { Box, Typography, Card, Stack } from "@mui/material";
import Grid from "@mui/material/Grid"; // ✅ Grid separate
import PhoneIcon from "@mui/icons-material/Phone";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface Props {
  weekDays: string[];
  checkIns: boolean[];
}

const ProgressScreen: React.FC<Props> = ({ weekDays, checkIns }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <EmojiEventsIcon sx={{ color: "success.main" }} />
        <Typography variant="h4">My Progress</Typography>
      </Stack>

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>
          This Week's Check-ins
        </Typography>
        <Grid container spacing={1}>
          {weekDays.map((day, idx) => (
            <Grid item xs={1} key={day}>
              <Box textAlign="center">
                <Typography variant="caption" display="block" mb={1}>
                  {day}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: checkIns[idx] ? "success.main" : "transparent",
                    border: checkIns[idx] ? "none" : "2px dashed lightgray",
                    color: checkIns[idx] ? "common.white" : "inherit",
                  }}
                >
                  {checkIns[idx] && "✓"}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card sx={{ p: 2, textAlign: "center", background: (t) => `linear-gradient(135deg, ${t.palette.success.light}, ${t.palette.success.main})`, color: 'common.white' }}>
            <Typography variant="h4">5/7</Typography>
            <Typography>Check-ins This Week</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ p: 2, textAlign: "center", background: (t) => `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`, color: 'common.white' }}>
            <PhoneIcon fontSize="small" />
            <Typography variant="h4">8</Typography>
            <Typography>Calls Made</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ p: 2, textAlign: "center", background: (t) => `linear-gradient(135deg, ${t.palette.secondary.light}, ${t.palette.secondary.main})`, color: 'common.white' }}>
            <EmojiEventsIcon fontSize="small" />
            <Typography variant="h4">12</Typography>
            <Typography>Tasks Completed</Typography>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ p: 2, textAlign: "center", background: (t) => `linear-gradient(135deg, ${t.palette.warning.light}, ${t.palette.warning.main})`, color: 'common.white' }}>
            <Typography variant="h4">23</Typography>
            <Typography>Active Days</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProgressScreen;
