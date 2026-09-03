import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

function LinearProgressWithLabel(props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        pl: { xs: 4, md: 19 },
        pr: 3,
        visibility: props.visibility,
      }}
    >
      <Box sx={{ width: '100%', mr: 1, visibility: props.visibility }}>
        <LinearProgress
          variant="determinate"
          {...props}
          sx={{ visibility: props.visibility }}
        />
      </Box>
      <Box sx={{ minWidth: 35, ml: 5, visibility: props.visibility }}>
        <Typography
          variant="p"
          sx={{ visibility: props.visibility }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default LinearProgressWithLabel;
