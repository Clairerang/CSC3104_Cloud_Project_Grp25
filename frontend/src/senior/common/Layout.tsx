import React from "react";
import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";

interface Props {
  title?: string;
  children: React.ReactNode;
  showAppBar?: boolean; // keep fundamentals; aesthetics opt-in
}

const Layout: React.FC<Props> = ({ title, children, showAppBar = false }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      {showAppBar && (
        <>
          <AppBar position="fixed" sx={{ bgcolor: "white", color: "text.primary", boxShadow: 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            </Toolbar>
          </AppBar>
          <Toolbar />
        </>
      )}
      <Container maxWidth="sm" sx={{ flex: 1, pb: 10 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;


