import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Container, Tabs, Tab, Box } from '@mui/material';
import { Link as LinkIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import UrlShortenerPage from './components/UrlShortenerPage';
import UrlStatisticsPage from './components/UrlStatisticsPage';
import RedirectHandler from './components/RedirectHandler';
import Logger from './utils/logger';
import { cleanupExpiredUrls } from './utils/storage';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = React.useState(0);

  useEffect(() => {
    // Initialize app
    Logger.info('app', 'URL Shortener app started');

    // Cleanup expired URLs on app start
    cleanupExpiredUrls();

    // Set up periodic cleanup (every 5 minutes)
    const cleanupInterval = setInterval(() => {
      cleanupExpiredUrls();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Redirect handler for short URLs */}
          <Route path="/:shortcode" element={<RedirectHandler />} />

          {/* Main app routes */}
          <Route path="/*" element={
            <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static">
                <Toolbar>
                  <LinkIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    URL Shortener
                  </Typography>
                </Toolbar>
              </AppBar>

              <Container maxWidth="lg" sx={{ mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={currentTab} onChange={handleTabChange} aria-label="navigation tabs">
                    <Tab
                      icon={<LinkIcon />}
                      label="Shorten URLs"
                      component="a"
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', '/');
                        setCurrentTab(0);
                      }}
                    />
                    <Tab
                      icon={<AnalyticsIcon />}
                      label="Statistics"
                      component="a"
                      href="/statistics"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', '/statistics');
                        setCurrentTab(1);
                      }}
                    />
                  </Tabs>
                </Box>

                <Routes>
                  <Route path="/" element={<UrlShortenerPage />} />
                  <Route path="/statistics" element={<UrlStatisticsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Container>
            </Box>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
