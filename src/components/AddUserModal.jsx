import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close, ContentCopy, PersonRemove } from '@mui/icons-material';
import UserCard from './UserCard';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadProjectMembers } from '../slices/projectmapSlice';
import { removeMemberApi } from '../api/membersApi';
import {
  sendInvite,
  fetchProjectInvitations,
  revokeInvitation,
} from '../api/invitationsApi';
import { ModalHeader } from './Modal/SitemapModalStyle';

const STATUS_COLOR = {
  pending: 'warning',
  accepted: 'success',
  expired: 'default',
  revoked: 'default',
};

const ROLES = [
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
];

export const AddUserModal = ({ open, setOpen, pid }) => {
  const { projectId: projId } = useParams();
  const projectId = projId || pid;
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.projectmap);
  const { user: currentUser } = useSelector((state) => state.auth);
  const projectUsers = users.filter((u) => u.projectId === projectId);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [devInviteUrl, setDevInviteUrl] = useState('');
  const [invitations, setInvitations] = useState([]);

  const refreshInvitations = () =>
    fetchProjectInvitations(projectId)
      .then(setInvitations)
      .catch(() => setInvitations([]));

  useEffect(() => {
    if (open && projectId) {
      dispatch(loadProjectMembers(projectId));
      refreshInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, dispatch]);

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setRole('member');
    setError('');
    setSuccess('');
    setDevInviteUrl('');
  };

  // Send (or re-send) an invitation. Re-sending regenerates the secure token,
  // so it also serves as "get a fresh invite link" for a pending invitation.
  const sendInvitation = async (inviteEmail, inviteRole) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setDevInviteUrl('');

    try {
      const result = await sendInvite(projectId, inviteEmail, inviteRole);
      if (result.status === 'already_member') {
        setSuccess(`${inviteEmail} is already a member of this project`);
      } else if (result.devInviteUrl) {
        // Email delivery is not configured (dev mode): the function returns
        // the accept link so it can be shared manually.
        setSuccess(`Invitation created for ${inviteEmail}`);
        setDevInviteUrl(result.devInviteUrl);
      } else {
        setSuccess(`Invitation sent to ${inviteEmail}`);
      }
      await refreshInvitations();
      dispatch(loadProjectMembers(projectId));
      setEmail('');
      setRole('member');
    } catch (err) {
      setError(err.message || 'Failed to invite user.');
      // The invitation may exist even though the email failed — offer the
      // accept link so the flow can still complete.
      if (err.devInviteUrl) {
        setDevInviteUrl(err.devInviteUrl);
        await refreshInvitations();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!email) {
      setError('Please enter an email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    await sendInvitation(email, role);
  };

  const handleRevoke = async (invitationId) => {
    setError('');
    try {
      await revokeInvitation(invitationId);
      await refreshInvitations();
    } catch (err) {
      setError(err.message || 'Failed to revoke invitation.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === currentUser?.id) return;
    try {
      await removeMemberApi(projectId, userId);
      dispatch(loadProjectMembers(projectId));
    } catch (err) {
      setError('Failed to remove member.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <ModalHeader>
        <Typography variant="h4">Manage Team</Typography>
        <IconButton onClick={handleClose} aria-label="Close">
          <Close />
        </IconButton>
      </ModalHeader>
      <Stack
        spacing={4}
        width="85%"
        display="flex"
        alignItems="center"
        alignSelf="center"
        p="2vh 0 2vh 0"
      >
        {/* Current Members */}
        <Typography variant="subtitle2" alignSelf="flex-start" color="text.secondary">
          Team Members ({projectUsers.length})
        </Typography>
        <Grid container gap={2} display="flex" justifyContent="center">
          {projectUsers.map((member) => (
            <Grid key={member.id} item xs={3} md={2} sx={{ position: 'relative' }}>
              <UserCard
                img={member.img}
                name={member.firstName || 'User'}
                role={member.role === 'manager' ? 'Manager' : 'Member'}
              />
              {member.id !== currentUser?.id && (
                <IconButton
                  size="small"
                  onClick={() => handleRemoveMember(member.id)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: '#fdecea',
                    '&:hover': { bgcolor: '#fcedec' },
                  }}
                  aria-label={`Remove ${member.firstName}`}
                >
                  <PersonRemove sx={{ fontSize: 14, color: '#f16460' }} />
                </IconButton>
              )}
            </Grid>
          ))}
        </Grid>

        {/* Invitations */}
        {invitations.length > 0 && (
          <>
            <Typography variant="subtitle2" alignSelf="flex-start" color="text.secondary">
              Invitations
            </Typography>
            <Stack spacing={1} alignSelf="stretch">
              {invitations.map((invite) => (
                <Stack
                  key={invite.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${invite.email} (${invite.role})`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={invite.status}
                      color={STATUS_COLOR[invite.status] || 'default'}
                      size="small"
                    />
                  </Stack>
                  {invite.status === 'pending' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => sendInvitation(invite.email, invite.role)}
                        disabled={loading}
                        aria-label={`Resend invitation for ${invite.email}`}
                      >
                        Resend
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRevoke(invite.id)}
                        aria-label={`Revoke invitation for ${invite.email}`}
                      >
                        Revoke
                      </Button>
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          </>
        )}

        {/* Invite Form */}
        <Typography variant="subtitle2" alignSelf="flex-start" color="text.secondary">
          Invite New Member
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        )}
        {devInviteUrl && (
          <Alert
            severity="info"
            sx={{ width: '100%', wordBreak: 'break-all' }}
            action={
              <IconButton
                size="small"
                onClick={() => navigator.clipboard?.writeText(devInviteUrl)}
                aria-label="Copy invite link"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            }
          >
            Share this invite link with the person you invited:{' '}
            <a href={devInviteUrl}>{devInviteUrl}</a>
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            label="Role"
          >
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary">
          The person you invite will receive a single invitation email (or
          shareable link) to join this project. Only invite people who have
          agreed to collaborate on it and expect this invitation.
        </Typography>
        <Button
          size="large"
          variant="contained"
          onClick={handleInvite}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Sending...' : 'Send Invite'}
        </Button>
      </Stack>
    </Dialog>
  );
};

export default AddUserModal;
