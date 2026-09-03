import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { authenticated, status, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (authenticated) {
      // Return to the page the user was trying to reach (set by
      // ProtectedRoute) or fall back to the start page.
      const from = location.state?.from;
      navigate(from ? `${from.pathname}${from.search || ''}` : '/projectmap/start', {
        replace: true,
      });
    }
  }, [authenticated, navigate, location.state]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) return;

    dispatch(loginUser({ email, password }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 2,
          }}
        >
          <Stack spacing={4} alignItems="center">
            <Typography variant="h3" color="primary.main" fontWeight={600}>
              ProjectMap
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: '100%' }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={status === 'loading'}
                  sx={{ py: 1.5 }}
                >
                  {status === 'loading' ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Don't have an account? Ask your project manager for an invitation.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Link component={RouterLink} to="/privacy">
                Privacy Policy
              </Link>
              {' · '}
              <Link component={RouterLink} to="/terms">
                Terms of Service
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
