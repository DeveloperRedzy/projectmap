import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from '@mui/material';
import { Link } from 'react-router-dom';

const ProjectPlannerCards = ({ projectData }) => {
  return (
    <Card sx={{ maxWidth: 300, minHeight: 393, mx: { xs: 'auto', md: 0 } }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="194"
          image={projectData.image}
          sx={{ maxWidth: 300, height: 'cover' }}
        />
        <CardContent>
          <Typography fontSize="20px" gutterBottom component="div">
            {projectData.title}
          </Typography>
          <Typography
            sx={{ pb: '25px', height: 88 }}
            fontSize="14px"
            color="text.secondary"
          >
            {projectData.description}
          </Typography>
          {projectData.linkTo !== null && (
            <Button
              component={Link}
              to={projectData.linkTo}
              variant="outlined"
              sx={{ width: '100%' }}
            >
              {projectData.buttonText}
            </Button>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProjectPlannerCards;
