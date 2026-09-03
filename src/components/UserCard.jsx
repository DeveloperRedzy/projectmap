import React from 'react';
import { Avatar, Stack, Typography } from '@mui/material';

export const UserCard = ({ name, img, role }) => {
  return (
    <Stack display="flex" alignItems="center">
      <Avatar src={img} alt={name} />
      <Typography textAlign="center">{name}</Typography>
      <Typography textAlign="center" fontWeight={600}>
        {role}
      </Typography>
    </Stack>
  );
};

export default UserCard;
