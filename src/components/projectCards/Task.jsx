import React, { useState } from 'react';
import {
  ChatBubbleOutline,
  Delete,
  DragHandle,
  Edit,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import styled from '@emotion/styled/macro';
import { useSelector } from 'react-redux';
import { useToggleTask, useDeleteTask } from '../../queries/useTasks';
import { useCommentCounts } from '../../queries/useComments';
import { MoreVertical } from 'react-feather';
import EditTaskModal from '../EditTaskModal';
import MoveTaskModal from '../MoveTaskModal';
import TaskCommentThread from '../TaskCommentThread';

const HoverIconButton = styled(IconButton)`
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s linear;

  /* Touch devices have no hover — keep the control reachable. */
  @media (hover: none) {
    visibility: visible;
    opacity: 1;
  }
`;

const HoverStack = styled(Stack)`
  width: 100%;
  :hover ${HoverIconButton} {
    visibility: visible;
    opacity: 1;
  }
`;

export const Task = ({ text, completed, id, categoryId, phaseId, isManager = true, assignedTo }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const users = useSelector((state) => state.projectmap.users);
  const toggleTask = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: commentCounts = {} } = useCommentCounts();
  const commentCount = commentCounts[id] || 0;
  const assignedUser = assignedTo ? users.find((u) => u.id === assignedTo) : null;
  const isAssignedToMe = assignedTo === user?.id;

  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleCompletedChange = () => {
    toggleTask.mutate({ id, userId: user?.id });
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate(id);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setEditOpen(true);
  };

  const handleMoveClick = () => {
    handleMenuClose();
    setMoveOpen(true);
  };

  return (
    <>
      <HoverStack display="flex" direction="row">
        <FormControlLabel
          sx={{
            flexGrow: 1,
            '& .MuiFormControlLabel-label': { flexGrow: 1, minWidth: 0 },
          }}
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                noWrap={false}
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  textDecoration: completed ? 'line-through' : '',
                  fontWeight: isAssignedToMe ? 600 : 400,
                  color: isAssignedToMe ? theme.palette.primary.light : 'inherit',
                }}
              >
                {text}
              </Typography>
              {assignedUser && (
                <Tooltip title={`Assigned to ${assignedUser.firstName} ${assignedUser.lastName}`}>
                  <Avatar
                    src={assignedUser.img || undefined}
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: '0.6rem',
                      bgcolor: isAssignedToMe ? theme.palette.primary.light : '#767676',
                      color: '#fff',
                    }}
                  >
                    {`${(assignedUser.firstName || '').charAt(0)}${(assignedUser.lastName || '').charAt(0)}`.toUpperCase()}
                  </Avatar>
                </Tooltip>
              )}
              {commentCount > 0 && (
                <Tooltip
                  title={`${commentCount} comment${commentCount !== 1 ? 's' : ''} — click to open`}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    onClick={(e) => {
                      e.preventDefault();
                      setCommentsOpen(true);
                    }}
                    sx={{ cursor: 'pointer', color: '#767676' }}
                  >
                    <ChatBubbleOutline sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{commentCount}</Typography>
                  </Stack>
                </Tooltip>
              )}
            </Stack>
          }
          control={
            <Checkbox
              checked={!!completed}
              onChange={handleCompletedChange}
              icon={<RadioButtonUnchecked />}
              checkedIcon={
                <RadioButtonChecked
                  sx={{ color: theme.palette.primary.light }}
                />
              }
              sx={{ '&:hover': { background: 0 } }}
            />
          }
        />
        <HoverIconButton
          size="small"
          sx={{ '&:hover': { background: 0 } }}
          aria-controls={open ? 'task-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          aria-label="Task options"
          onClick={handleMenuOpen}
        >
          <MoreVertical fontSize="small" color={theme.palette.primary.light} />
        </HoverIconButton>
        <Menu
          id="task-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'task-options-button',
            disablePadding: true,
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              setCommentsOpen(true);
            }}
          >
            <ChatBubbleOutline sx={{ mr: 5, color: theme.palette.primary.light }} />
            <Typography color={theme.palette.primary.light}>Comments</Typography>
          </MenuItem>
          {isManager && (
            <MenuItem onClick={handleEditClick}>
              <Edit sx={{ mr: 5, color: theme.palette.primary.light }} />
              <Typography color={theme.palette.primary.light}>Edit</Typography>
            </MenuItem>
          )}
          {isManager && (
            <MenuItem onClick={handleMoveClick}>
              <DragHandle sx={{ mr: 5, color: theme.palette.primary.light }} />
              <Typography color={theme.palette.primary.light}>Move</Typography>
            </MenuItem>
          )}
          {isManager && (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleDeleteTask();
              }}
            >
              <Delete sx={{ mr: 5, color: '#f16460' }} />
              <Typography color="#f16460">Delete</Typography>
            </MenuItem>
          )}
        </Menu>
      </HoverStack>

      <EditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        taskId={id}
        currentText={text}
      />

      <MoveTaskModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        taskId={id}
        currentPhaseId={phaseId}
        currentCategoryId={categoryId}
      />

      <TaskCommentThread
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        taskId={id}
        taskText={text}
      />
    </>
  );
};

export default Task;
