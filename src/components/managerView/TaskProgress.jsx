import React, { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import AccordionDetailsTable from './AccordionDetailsTable';

const TaskProgress = ({ tasks, sx, projectId }) => {
  const [filter, setFilter] = useState('all');

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed === 100),
    [tasks],
  );
  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.completed < 100),
    [tasks],
  );

  const tableTasks = useMemo(() => {
    if (filter === 'completed') return completedTasks;
    if (filter === 'in_progress') return inProgressTasks;
    return tasks;
  }, [filter, tasks, completedTasks, inProgressTasks]);

  const focusedTask = tableTasks.length;
  const focusedTaskDesc =
    filter === 'completed'
      ? "TO DO'S COMPLETED"
      : filter === 'in_progress'
        ? "TO DO'S IN PROGRESS"
        : "TO DO'S";

  return (
    <>
      <Typography
        fontWeight="300"
        onClick={() => setFilter('all')}
        sx={{ cursor: 'pointer', fontSize: { xs: '32px', md: '48px' } }}
      >
        {tasks.length} TO DO&apos;S
      </Typography>
      {tasks.length !== 0 && (
        <>
          <Box
            sx={{
              width: '100%',
              height: '5px',
              display: 'flex',
              flexDirection: 'row',
              ...sx,
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              width={`${(completedTasks.length / tasks.length) * 100}%`}
              onClick={() => setFilter('completed')}
              sx={{ cursor: 'pointer' }}
            >
              <Box width="100%" bgcolor="#4CAF50" height="4px">
                <p></p>
              </Box>
              {completedTasks.length !== 0 && (
                <Typography
                  pt={5}
                  alignSelf="flex-end"
                >{`${completedTasks.length} Completed`}</Typography>
              )}
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              width={`${(inProgressTasks.length / tasks.length) * 100}%`}
              onClick={() => setFilter('in_progress')}
              sx={{ cursor: 'pointer' }}
            >
              <Box width="100%" bgcolor="#FF9800" height="4px">
                <p></p>
              </Box>
              {inProgressTasks.length !== 0 && (
                <Typography
                  pt={5}
                  alignSelf="flex-end"
                >{`${inProgressTasks.length} in progress`}</Typography>
              )}
            </Box>
          </Box>
          <Box pt={{ xs: 10, md: 20 }}>
            <Typography variant="h3" py={5}>
              {focusedTask} {focusedTaskDesc}
            </Typography>
            <AccordionDetailsTable tableTasks={tableTasks} projectId={projectId} />
          </Box>
        </>
      )}
    </>
  );
};

export default TaskProgress;
