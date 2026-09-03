import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  ButtonBase,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import AddProject from '../../components/AddProject';
import ProjectAccordionManagerView from './ProjectAccordionManagerView';
import { useTasks } from '../../queries/useTasks';
import { usePhases } from '../../queries/usePhases';
import { useCategories } from '../../queries/useCategories';

const ProjectListManagerView = ({ filters = {} }) => {
  const theme = useTheme();
  const isLessThanMd = useMediaQuery(theme.breakpoints.down('md'));
  const projects = useSelector((state) => state.projectmap.projects);
  const users = useSelector((state) => state.projectmap.users);
  const { user } = useSelector((state) => state.auth);
  const { data: phases = [] } = usePhases();
  const { data: categories = [] } = useCategories();
  const { data: tasks = [] } = useTasks();
  const [isAdding, setIsAdding] = useState(false);
  const [lastAdded, setLastAdded] = useState(undefined);

  // The Manager View is a dashboard of projects the user MANAGES. Projects
  // where they are only a member are excluded (all controls here are
  // manager-level: dates, assignment, task actions, team management).
  const managedProjects = useMemo(
    () =>
      projects.filter((project) =>
        users.some(
          (membership) =>
            membership.projectId === project.id &&
            membership.id === user?.id &&
            membership.role === 'manager',
        ),
      ),
    [projects, users, user?.id],
  );

  const filteredProjects = useMemo(() => {
    let result = managedProjects;

    if (filters.searchQuery) {
      result = result.filter((project) =>
        project.name.toLowerCase().includes(filters.searchQuery),
      );
    }

    if (filters.statusFilter && filters.statusFilter !== 'all') {
      result = result.filter((project) => {
        // Tasks belong to categories, which belong to phases of the project.
        const projectPhaseIds = phases
          .filter((phase) => phase.projectId === project.id)
          .map((phase) => phase.id);
        const projectCategoryIds = categories
          .filter((category) => projectPhaseIds.includes(category.phaseId))
          .map((category) => category.id);
        const projectTasks = tasks.filter((task) =>
          projectCategoryIds.includes(task.categoryId),
        );

        if (projectTasks.length === 0) return true;

        if (filters.statusFilter === 'completed') {
          return projectTasks.every((task) => task.completed === 100);
        }
        if (filters.statusFilter === 'in_progress') {
          return projectTasks.some((task) => task.completed !== 100);
        }
        return true;
      });
    }

    return result;
  }, [managedProjects, tasks, phases, categories, filters]);

  return (
    <Grid container gap={5} p="2vh 1.5vw 2vh 1.5vw">
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
      {filteredProjects.length === 0 && !isAdding && (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            variant="h3"
            sx={{ color: theme.palette.primary.light }}
          >
            {managedProjects.length === 0
              ? 'Create a new project to start mapping'
              : 'No projects match your filters'}
          </Typography>
        </Grid>
      )}
      {filteredProjects.map((project) => (
        <Grid key={project.id} item xs={12}>
          <ProjectAccordionManagerView
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
  );
};

export default ProjectListManagerView;
