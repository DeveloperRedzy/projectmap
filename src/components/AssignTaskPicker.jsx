import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import { PersonOutline, PersonOff } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAssignTask } from '../queries/useTasks';
import { getInitials } from '../util/getInitials';

const AssignTaskPicker = ({ taskId, assignedTo, projectId }) => {
  const { users } = useSelector((state) => state.projectmap);
  const assignTask = useAssignTask();
  const projectMembers = users.filter((u) => u.projectId === projectId);
  const assignedUser = assignedTo
    ? users.find((u) => u.id === assignedTo)
    : null;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAssign = (userId) => {
    assignTask.mutate({ id: taskId, userId });
    setAnchorEl(null);
  };

  const handleUnassign = () => {
    assignTask.mutate({ id: taskId, userId: null });
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={assignedUser
        ? `Assigned to ${assignedUser.firstName} ${assignedUser.lastName} — click to change`
        : 'Click to assign'
      }>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Assign task"
        >
          {assignedUser ? (
            <Avatar
              src={assignedUser.img}
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.875rem',
                bgcolor: '#1976D2',
                color: '#fff',
              }}
            >
              {getInitials(assignedUser.firstName, assignedUser.lastName)}
            </Avatar>
          ) : (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#EFEFEF',
                color: '#767676',
              }}
            >
              <PersonOutline fontSize="small" />
            </Avatar>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { maxHeight: 300, minWidth: 200 } }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Assign to
        </Typography>
        {projectMembers.map((member) => (
          <MenuItem
            key={member.id}
            onClick={() => handleAssign(member.id)}
            selected={member.id === assignedTo}
          >
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <Avatar
                src={member.img}
                sx={{ width: 28, height: 28, fontSize: '0.75rem' }}
              >
                {getInitials(member.firstName, member.lastName)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${member.firstName} ${member.lastName}`}
              secondary={member.role === 'manager' ? 'Manager' : 'Member'}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
        {assignedTo && <Divider />}
        {assignedTo && (
          <MenuItem onClick={handleUnassign}>
            <ListItemAvatar sx={{ minWidth: 40 }}>
              <PersonOff sx={{ fontSize: 20, color: '#767676' }} />
            </ListItemAvatar>
            <ListItemText
              primary="Unassign"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </MenuItem>
        )}
        {projectMembers.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary="No team members"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default AssignTaskPicker;
