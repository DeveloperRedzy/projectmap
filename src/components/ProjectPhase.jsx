import React, { useState } from 'react';
import { Add } from '@mui/icons-material';

import {
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  Typography,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { useTasks } from '../queries/useTasks';
import { useCategories, useCreateCategory } from '../queries/useCategories';
import PrimaryCard from './projectCards/PrimaryCard';
import SecondaryCard from './projectCards/SecondaryCard.jsx';
import useProjectRole from '../util/useProjectRole';

export const ProjectPhase = ({ id, name, sx, dueDate, projectId }) => {
  const theme = useTheme();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const { data: tasks = [] } = useTasks();
  const phaseCategories = categories.filter(
    (category) => category.phaseId === id,
  );
  const phaseCategoryIds = phaseCategories.map((c) => c.id);
  const phaseTasks = tasks.filter((task) => phaseCategoryIds.includes(task.categoryId));
  const { isManager } = useProjectRole(projectId);
  const [expanded, setExpanded] = useState(true);
  const getCompletedTaskAmount = () =>
    phaseTasks.filter((task) => task.completed === 100).length;

  const handleAddCategory = () => {
    createCategory.mutate({
      name: 'Outcome',
      phase_id: id,
    });
  };

  return (
    <Stack spacing={2} sx={{ width: '25em', ...sx }}>
      <Timeline sx={{ display: 'flex' }}>
        <TimelineItem sx={{ alignSelf: 'flex-end' }}>
          <TimelineContent>
            <PrimaryCard
              phaseId={id}
              projectId={projectId}
              isManager={isManager}
              name={name}
              dueDate={dueDate}
              completedTasks={getCompletedTaskAmount()}
              totalTasks={phaseTasks.length}
              expanded={expanded}
              setExpanded={setExpanded}
              sx={{ width: '17.5em' }}
            />
          </TimelineContent>
        </TimelineItem>
        {expanded &&
          phaseCategories.map((category, index) => {
            const categoryTasks = phaseTasks.filter(
              (task) => task.categoryId === category.id,
            );
            const completedCategoryTasks = categoryTasks.filter(
              (task) => task.completed === 100,
            );
            return (
              <TimelineItem key={category.id} sx={{ alignSelf: 'flex-end' }}>
                <TimelineSeparator>
                  {index !== 0 && (
                    <TimelineConnector
                      sx={{ bgcolor: theme.palette.primary.light }}
                    />
                  )}
                  <TimelineDot
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      textAlign="center"
                      width="4em"
                      fontSize={9}
                    >{`${completedCategoryTasks.length}/${categoryTasks.length}`}</Typography>
                  </TimelineDot>
                  {index !== phaseCategories.length - 1 && (
                    <TimelineConnector
                      sx={{ bgcolor: theme.palette.primary.light }}
                    />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <SecondaryCard
                    categoryId={category.id}
                    phaseId={id}
                    name={category.name}
                    expanded={expanded}
                    isManager={isManager}
                    sx={{ width: '17.5em' }}
                  />
                </TimelineContent>
              </TimelineItem>
            );
          })}
        {expanded && isManager && (
          <TimelineItem sx={{ alignSelf: 'center' }}>
            <TimelineContent>
              <Tooltip
                placement="right"
                title="The outcomes are what the business wants or needs to achieve. The outputs are the actions or items that contribute to achieving an outcome."
              >
                <IconButton
                  sx={{
                    width: '3rem',
                    height: '3rem',
                    alignSelf: 'center',
                    background: theme.palette.neutral.lightBlue,
                  }}
                  size="small"
                  onClick={handleAddCategory}
                >
                  <Add sx={{ color: theme.palette.primary.light }} />
                </IconButton>
              </Tooltip>
            </TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    </Stack>
  );
};

export default ProjectPhase;
