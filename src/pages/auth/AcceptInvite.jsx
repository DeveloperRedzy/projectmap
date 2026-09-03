import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  loginUser,
  logoutUser,
  clearError,
} from '../../redux/slices/authSlice';
import { getInvitationByToken, acceptInvitation } from '../../api/invitationsApi';

const Centered = ({ children }) => (
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
      <Paper elevation={3} sx={{ p: { xs: 4, sm: 6 }, borderRadius: 2 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h3" color="primary.main" fontWeight={600}>
            ProjectMap
          </Typography>
          {children}
        </Stack>
      </Paper>
    </Container>
  </Box>
);

const AcceptInvite = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { authenticated, user, status, error } = useSelector(
    (state) => state.auth,
  );

  const [invite, setInvite] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [acceptError, setAcceptError] = useState('');
  const acceptStartedRef = useRef(false);

  // Load the invitation by its token.
  useEffect(() => {
    let active = true;
    if (!token) {
      setLoadingInvite(false);
      return;
    }
    getInvitationByToken(token)
      .then((data) => active && setInvite(data))
      .catch(() => active && setInvite({ status: 'error' }))
      .finally(() => active && setLoadingInvite(false));
    return () => {
      active = false;
    };
  }, [token]);

  // The invite is bound to one email; only that account may accept it.
  const emailMatches =
    !!user?.email &&
    !!invite?.email &&
    user.email.toLowerCase() === invite.email.toLowerCase();

  // Once authenticated as the invited account, accept and go to the project.
  useEffect(() => {
    if (!authenticated || !token || invite?.status !== 'pending') return;
    if (!emailMatches) return;
    if (acceptStartedRef.current) return;
    acceptStartedRef.current = true;
    acceptInvitation(token)
      .then((res) =>
        navigate(`/projectmap/overview/${res?.project_id || invite.project_id}`),
      )
      .catch((err) => {
        setAcceptError(err?.message || 'Could not accept this invitation.');
        acceptStartedRef.current = false;
      });
  }, [authenticated, emailMatches, token, invite, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (mode === 'signup') {
      if (!firstName || !lastName || !password) {
        setLocalError('Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      dispatch(registerUser({ email: invite.email, password, firstName, lastName }));
    } else {
      if (!password) {
        setLocalError('Please enter your password.');
        return;
      }
      dispatch(loginUser({ email: invite.email, password }));
    }
  };

  if (loadingInvite) {
    return (
      <Centered>
        <CircularProgress />
        <Typography color="text.secondary">Checking your invitation…</Typography>
      </Centered>
    );
  }

  if (!token || !invite || invite.status === 'not_found' || invite.status === 'error') {
    return (
      <Centered>
        <Alert severity="error" sx={{ width: '100%' }}>
          This invitation link is invalid or no longer exists.
        </Alert>
        <Button onClick={() => navigate('/login')}>Go to sign in</Button>
      </Centered>
    );
  }

  if (invite.status === 'expired') {
    return (
      <Centered>
        <Alert severity="warning" sx={{ width: '100%' }}>
          This invitation has expired. Ask the project manager to send a new one.
        </Alert>
        <Button onClick={() => navigate('/login')}>Go to sign in</Button>
      </Centered>
    );
  }

  if (invite.status === 'revoked') {
    return (
      <Centered>
        <Alert severity="warning" sx={{ width: '100%' }}>
          This invitation has been revoked.
        </Alert>
        <Button onClick={() => navigate('/login')}>Go to sign in</Button>
      </Centered>
    );
  }

  if (invite.status === 'accepted') {
    return (
      <Centered>
        <Alert severity="info" sx={{ width: '100%' }}>
          This invitation has already been accepted.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Sign in
        </Button>
      </Centered>
    );
  }

  // Pending — but signed in as a different account than the invitee.
  if (authenticated && !emailMatches) {
    return (
      <Centered>
        <Alert severity="info" sx={{ width: '100%' }}>
          This invitation is for <strong>{invite.email}</strong>, but you are
          signed in as <strong>{user?.email}</strong>.
        </Alert>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Sign out to create the invited account (or sign in with it) and join{' '}
          {invite.project_name}.
        </Typography>
        <Button variant="contained" onClick={() => dispatch(logoutUser())}>
          Sign out and continue
        </Button>
      </Centered>
    );
  }

  // Pending — and we are authenticated: acceptance is in flight (or just failed).
  if (authenticated) {
    return (
      <Centered>
        {acceptError ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {acceptError}
          </Alert>
        ) : (
          <>
            <CircularProgress />
            <Typography color="text.secondary">
              Joining {invite.project_name}…
            </Typography>
          </>
        )}
      </Centered>
    );
  }

  // Pending — collect credentials (sign up or sign in) for the invited email.
  const displayError = localError || error;
  return (
    <Centered>
      <Typography variant="h5">{invite.project_name}</Typography>
      <Typography variant="body2" color="text.secondary">
        Invitation for {invite.email}
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {displayError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <Stack spacing={3}>
          {mode === 'signup' && (
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Stack>
          )}
          <TextField
            fullWidth
            label="Email"
            value={invite.email}
            InputProps={{ readOnly: true }}
            disabled
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            helperText={mode === 'signup' ? 'At least 6 characters' : undefined}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={status === 'loading'}
            sx={{ py: 1.5 }}
          >
            {status === 'loading'
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create account & join'
                : 'Sign in & join'}
          </Button>
        </Stack>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        onClick={() => {
          setMode((m) => (m === 'signup' ? 'login' : 'signup'));
          setLocalError('');
          dispatch(clearError());
        }}
      >
        {mode === 'signup'
          ? 'Already have an account? Sign in'
          : 'Need an account? Create one'}
      </Typography>
    </Centered>
  );
};

export default AcceptInvite;
