import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  ButtonBase,
  Grid,
  useMediaQuery,
  useTheme,
  Typography,
  Snackbar,
  Alert,
  Container,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ProjectAccordion from '../../components/ProjectAccordion';
import AddProject from '../../components/AddProject';
import { setAlertOpened } from '../../slices/projectmapSlice';

const ProjectList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isLessThanMd = useMediaQuery(theme.breakpoints.down('md'));

  const projects = useSelector((state) => state.projectmap.projects);
  const alertOpened = useSelector((state) => state.projectmap.alertOpened);

  const [isAdding, setIsAdding] = useState(false);

  const [lastAdded, setLastAdded] = useState(undefined);

  const handleClose = () => {
    dispatch(setAlertOpened(false));
  };
  return (
    <Container
      disableGutters
      sx={{
        maxWidth: '1080px',
      }}
    >
      <Grid container gap={5} p="4vh 1.5vw 4vh 1.5vw">
        <Grid
          item
          xs={12}
          sx={{ background: theme.palette.neutral.light, height: '100%' }}
        >
          <Box
            sx={{
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: isLessThanMd ? '98%' : '5rem',
            }}
          >
            {isAdding ? (
              <AddProject
                sx={{ width: '99%', height: '98%' }}
                setIsAdding={setIsAdding}
                setLastAdded={setLastAdded}
              />
            ) : (
              <ButtonBase
                sx={{
                  width: '100%',
                  height: '100%',
                  background: theme.palette.neutral.lightBlue,
                }}
                onClick={() => setIsAdding(true)}
              >
                <Add
                  fontSize="large"
                  sx={{
                    color: theme.palette.primary.light,
                    p: isLessThanMd ? '1vh 0 1vh 0' : '',
                  }}
                />
              </ButtonBase>
            )}
          </Box>
        </Grid>
        {projects.length === 0 && !isAdding && (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography
              variant={'h3'}
              sx={{ color: theme.palette.primary.light }}
            >
              Create a new project to start mapping
            </Typography>
          </Grid>
        )}
        {projects.map((project) => (
          <Grid key={project.id} item xs={12}>
            <ProjectAccordion
              {...project}
              summarySx={{
                background: theme.palette.neutral.empty,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              isExpanded={lastAdded === project.id}
            />
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={alertOpened}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          You have successfully deleted the project
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectList;
