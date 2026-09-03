import React from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { PersonAddAlt } from '@mui/icons-material';
import { useSelector } from 'react-redux';

export const ProjectUsers = ({ projectId, setModalOpen, isManager = true }) => {
  const theme = useTheme();
  const users = useSelector((state) => state.projectmap.users);
  const projectUsers = users.filter((user) => user.projectId === projectId);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AvatarGroup
        componentsProps={{
          additionalAvatar: {
            sx: {
              height: 21,
              width: 21,
              fontSize: 8,
              background: theme.palette.primary.light,
            },
          },
        }}
      >
        {projectUsers.map((user) => (
          <Avatar
            key={user.id}
            alt={`${user.firstName} ${user.lastName}`}
            src={user.img}
            sx={{ height: 21, width: 21 }}
          />
        ))}
      </AvatarGroup>
      {isManager && (
        <Tooltip title="Add Person">
          <IconButton
            sx={{
              height: 35,
              width: 35,
              ml: '16px',
            }}
            onClick={() => setModalOpen(true)}
          >
            <PersonAddAlt sx={{ color: theme.palette.primary.light }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ProjectUsers;
