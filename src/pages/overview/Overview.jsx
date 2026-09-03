import React from 'react';
import {
  Grid,
  IconButton,
  Container,
  Typography,
  Chip,
  ButtonBase,
  Tooltip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import ProjectPhase from '../../components/ProjectPhase';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { usePhases, useCreatePhase } from '../../queries/usePhases';
import TimeLineSlider from '../../components/TimeLineSlider';
import { useTheme } from '@mui/system';
import useProjectRole from '../../util/useProjectRole';
import { addDays } from '../../util/addDays';

const Overview = ({ projectId, fixed }) => {
  const { projectId: pid } = useParams();
  const projId = pid || projectId;
  const theme = useTheme();
  const { projects } = useSelector((state) => state.projectmap);
  const { data: phases = [] } = usePhases();
  const createPhase = useCreatePhase();
  const projectPhases = phases.filter((phase) => phase.projectId === projId);
  const phaseDueDates = projectPhases.map((phase) => {
    return {
      date: phase.dueDate.toString(),
      phaseName: phase.name,
    };
  });
  const project = projects.find((project) => project.id === projId);
  const { isManager } = useProjectRole(projId);

  if (!project) {
    // Projects are still loading (hard refresh) or the URL points at a
    // project the user cannot see. The layout shows the loading state;
    // rendering nothing here avoids crashing on project.startDate below.
    return null;
  }

  const calculateDayAmount = () => {
    const date1 = new Date(project.startDate);
    const date2 = new Date(project.endDate);
    const timeDifference = date2.getTime() - date1.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    const dates = [];
    for (let i = 0; i < dayDifference; i++) {
      dates.push(addDays(date1, i));
    }
    return dates;
  };

  const dateArray = calculateDayAmount();

  const handleAddPhase = () => {
    createPhase.mutate({
      name: 'Milestone',
      project_id: projId,
      due_date: new Date().toISOString(),
    });
  };

  return (
    <Container
      disableGutters
      sx={{
        maxWidth: '1080px',
      }}
    >
      <Grid container gap={5} pt="8vh">
        <TimeLineSlider
          dateArray={dateArray}
          phaseDueDates={phaseDueDates}
          fixed={fixed}
        />
        <Grid
          item
          container
          xs={12}
          wrap="nowrap"
          marginTop={!projectId && '80px'}
          p="20px"
          overflow="auto"
          justifyContent={projectPhases.length === 0 && 'center'}
        >
          {projectPhases.map((phase) => (
            <Grid
              key={phase.id}
              xs={12}
              sm={12}
              md={6}
              lg={4}
              xl={2}
              item
              minWidth={'27em'}
            >
              <ProjectPhase {...phase} />
            </Grid>
          ))}
          {isManager && (
          <Grid
            item
            xs={12}
            sm={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {projectPhases.length !== 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Tooltip
                  placement="right"
                  title="A milestone is a specific point within a project's life cycle used to measure the progress toward the ultimate goal. Milestones in project management are used as signal posts for a project's start or end date, external reviews or input, budget checks, submission of a major deliverable, and many more. Example: Project started, Project end, Version 1 delivered, requirements collected."
                >
                  <IconButton
                    onClick={handleAddPhase}
                    sx={{
                      width: '4rem',
                      height: '4rem',
                      background: theme.palette.neutral.lightBlue,
                    }}
                  >
                    <Add
                      fontSize="large"
                      sx={{
                        color: theme.palette.primary.light,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            ) : (
              <ButtonBase onClick={handleAddPhase}>
                <Chip
                  sx={{
                    width: '100%',
                    minHeight: '5vh',
                    background: theme.palette.neutral.lightBlue,
                    '.MuiChip-icon': {
                      color: theme.palette.primary.light,
                      fontSize: 30,
                    },
                    '&:hover': { cursor: 'pointer' },
                  }}
                  icon={<Add />}
                  label={
                    <Typography variant="p">
                      Create your first milestone
                    </Typography>
                  }
                />
              </ButtonBase>
            )}
          </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Overview;
