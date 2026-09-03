import React from 'react';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/** Shared shell for the public legal pages (Privacy Policy, Terms of Service). */
const LegalPage = ({ title, updated, children }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 4, sm: 8 }, borderRadius: 2 }}>
          <Stack spacing={4}>
            <Typography variant="h3" color="primary.main" fontWeight={600}>
              ProjectMap
            </Typography>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {updated}
            </Typography>
            {children}
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Back to sign in
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export const LegalSection = ({ heading, children }) => (
  <Stack spacing={2}>
    <Typography variant="h6">{heading}</Typography>
    <Typography variant="body1" color="text.secondary" component="div">
      {children}
    </Typography>
  </Stack>
);

export default LegalPage;
