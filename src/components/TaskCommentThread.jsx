import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Check, Close, Delete, Edit, Send } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { commentCountsKey } from '../queries/useComments';
import {
  fetchComments,
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from '../api/commentsApi';
import { getInitials } from '../util/getInitials';

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const TaskCommentThread = ({ open, onClose, taskId, taskText }) => {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const refreshCounts = () =>
    queryClient.invalidateQueries({ queryKey: commentCountsKey });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const loadComments = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await fetchComments(taskId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, loadComments]);

  const handleSend = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !user?.id) return;

    setSending(true);
    try {
      const comment = await createCommentApi(taskId, user.id, trimmed);
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      refreshCounts();
    } catch (err) {
      console.error('Failed to send comment:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      refreshCounts();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || !editingId) return;
    try {
      const updated = await updateCommentApi(editingId, trimmed);
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, content: updated.content, updated_at: updated.updated_at }
            : c,
        ),
      );
      cancelEditing();
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Comments</Typography>
            <Typography variant="caption" color="text.secondary">
              {taskText}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ minHeight: 200, maxHeight: 400, overflow: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && comments.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              No comments yet. Be the first to comment.
            </Typography>
          )}

          {comments.map((comment) => {
            const isOwn = comment.user_id === user?.id;
            const profile = comment.profiles;
            return (
              <Box key={comment.id}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    src={profile?.avatar_url}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.8rem',
                      bgcolor: isOwn ? '#1976D2' : '#767676',
                      mt: 0.5,
                    }}
                  >
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">
                        {profile?.first_name} {profile?.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(comment.created_at)}
                      </Typography>
                      {isOwn && editingId !== comment.id && (
                        <Stack direction="row" sx={{ ml: 'auto' }}>
                          <IconButton
                            size="small"
                            onClick={() => startEditing(comment)}
                            aria-label="Edit comment"
                          >
                            <Edit sx={{ fontSize: 16, color: '#1976D2' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(comment.id)}
                            aria-label="Delete comment"
                          >
                            <Delete sx={{ fontSize: 16, color: '#f16460' }} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    {editingId === comment.id ? (
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          multiline
                          maxRows={3}
                          autoFocus
                        />
                        <IconButton
                          size="small"
                          onClick={handleSaveEdit}
                          disabled={!editText.trim()}
                          aria-label="Save comment"
                        >
                          <Check sx={{ fontSize: 18, color: '#4BB14F' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={cancelEditing}
                          aria-label="Cancel editing"
                        >
                          <Close sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Divider sx={{ mt: 1.5 }} />
              </Box>
            );
          })}
        </Stack>

        {/* Comment input */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={3}
            autoFocus
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !newComment.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
            aria-label="Send comment"
          >
            <Send fontSize="small" />
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCommentThread;
