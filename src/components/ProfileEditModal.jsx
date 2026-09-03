import React, { useState, useEffect } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useProfile, useUpdateProfile } from '../queries/useProfile';

const ProfileEditModal = ({ open, onClose, isFirstLogin = false }) => {
  const { user } = useSelector((state) => state.auth);
  const { data: profile } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();
  const loading = updateProfile.isPending;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Seed the form from the cached profile when the dialog opens.
  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [open, profile]);

  const handleSave = () => {
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    setError('');
    setSuccess(false);

    updateProfile.mutate(
      {
        userId: user.id,
        updates: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          avatar_url: avatarUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => onClose(true), 500);
        },
        onError: (err) => setError(err.message || 'Failed to update profile.'),
      },
    );
  };

  const getInitials = () => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || '?';
  };

  return (
    <Dialog
      open={open}
      onClose={isFirstLogin ? undefined : () => onClose(false)}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown={isFirstLogin}
    >
      <DialogTitle>
        {isFirstLogin ? 'Welcome! Set up your profile' : 'Edit Profile'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} alignItems="center" sx={{ mt: 1 }}>
          {isFirstLogin && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Please enter your name so your team can identify you.
            </Typography>
          )}

          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              bgcolor: '#1976D2',
              color: '#fff',
            }}
          >
            {getInitials()}
          </Avatar>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ width: '100%' }}>
              Profile updated!
            </Alert>
          )}

          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Stack>

          <TextField
            fullWidth
            label="Avatar URL (optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/your-photo.jpg"
            helperText="Paste a link to your profile picture"
          />

          <Typography variant="caption" color="text.secondary">
            Email: {user?.email}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        {!isFirstLogin && (
          <Button onClick={() => onClose(false)}>Cancel</Button>
        )}
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditModal;
