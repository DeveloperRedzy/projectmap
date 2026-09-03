import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Tooltip,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import {
  CallMade,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Task,
  TimerOutlined,
} from '@mui/icons-material';
import { updateProject } from '../../slices/projectmapSlice';
import { useTasks } from '../../queries/useTasks';
import { usePhases } from '../../queries/usePhases';
import { useCategories } from '../../queries/useCategories';
import AddUserModal from '../AddUserModal';
import { WhiteButton } from '../ButtonStyles';
import LinearProgressWithLabel from './LinearProgressWithLabel';
import TaskProgress from './TaskProgress';
import { useNavigate } from 'react-router-dom';

const ProjectAccordionManagerView = ({
  id,
  name,
  endDate,
  startDate,
  summarySx,
  isExpanded,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isLessThanMd = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { data: phases = [] } = usePhases();
  const { data: categories = [] } = useCategories();
  const { data: tasks = [] } = useTasks();
  const projectPhaseIds = phases
    .filter((phase) => phase.projectId === id)
    .map((phase) => phase.id);
  const projectCategoryIds = categories
    .filter((cat) => projectPhaseIds.includes(cat.phaseId))
    .map((cat) => cat.id);
  const projectTasks = tasks.filter((task) =>
    projectCategoryIds.includes(task.categoryId),
  );
  //const navigate = useNavigate();

  const [expanded, setExpanded] = useState(isExpanded || false);

  const [modalOpen, setModalOpen] = useState(false);

  const getCompletedTaskAmount = () =>
    projectTasks.filter((task) => task.completed === 100).length;

  const getDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  };

  const getDeadlineConfig = () => {
    const days = getDaysRemaining();
    if (days < 0) {
      return {
        color: '#d32f2f',
        bgColor: '#fdecea',
        tooltip: `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`,
        label: `-${Math.abs(days)}d`,
      };
    }
    if (days <= 3) {
      return {
        color: '#d32f2f',
        bgColor: '#fdecea',
        tooltip: `${days} day${days !== 1 ? 's' : ''} remaining — urgent!`,
        label: `${days}d`,
      };
    }
    if (days <= 5) {
      return {
        color: '#ffa12e',
        bgColor: '#fff3e5',
        tooltip: `${days} day${days !== 1 ? 's' : ''} remaining`,
        label: `${days}d`,
      };
    }
    return {
      color: '#4BB14F',
      bgColor: '#e8f5e9',
      tooltip: `${days} day${days !== 1 ? 's' : ''} remaining`,
      label: `${days}d`,
    };
  };

  const deadlineConfig = getDeadlineConfig();

  const updateStartDate = (newDate) => {
    dispatch(updateProject({ id, data: { startDate: newDate.toString() } }));
  };

  const updateEndDate = (newDate) => {
    dispatch(updateProject({ id, data: { endDate: newDate.toString() } }));
  };

  return (
    <>
      <AddUserModal open={modalOpen} setOpen={setModalOpen} pid={id} />
      <Accordion
        expanded={expanded}
        sx={{
          '& .Mui-focusVisible': {
            backgroundColor: 'white !important',
          },
        }}
      >
        <AccordionSummary
          sx={{ height: isLessThanMd ? '' : '5rem', ...summarySx }}
        >
          <Stack direction="column" width={'100%'}>
            <Stack
              direction={isLessThanMd ? 'column' : 'row'}
              gap={isLessThanMd ? 4 : 7}
              width={'100%'}
              alignItems={'center'}
            >
              <IconButton
                sx={{ background: theme.palette.neutral.lightBlue, ml: '5px' }}
                onClick={() => navigate(`../overview/${id}`)}
              >
                <Task sx={{ color: theme.palette.primary.light }} />
              </IconButton>
              <Typography
                variant={'h5'}
                sx={{
                  display: { xs: 'flex' },
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  flexGrow: 1,
                }}
              >
                {name}
              </Typography>
              {/* Dates are edited here on desktop; on phones the header stays
                  compact — dates remain editable inside the project view. */}
              <Stack
                direction="row"
                alignItems="center"
                gap={4}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <Typography>Start</Typography>
                <DatePicker
                  maxDate={new Date(endDate)}
                  onChange={updateStartDate}
                  value={startDate}
                  label="Start"
                  inputFormat="DD/MM/YYYY"
                  renderInput={(params) => (
                    <TextField
                      size="small"
                      color="primaryLight"
                      variant="filled"
                      sx={{
                        width: { lg: '15em', md: '10em' },
                        backgroundColor: '#fafafa',
                        '& .MuiFilledInput-root': {
                          backgroundColor: '#fafafa',
                        },
                      }}
                      {...params}
                    />
                  )}
                />
                <Typography>End</Typography>
                <DatePicker
                  minDate={new Date(startDate)}
                  onChange={updateEndDate}
                  value={endDate}
                  label="End"
                  inputFormat="DD/MM/YYYY"
                  renderInput={(params) => (
                    <TextField
                      size="small"
                      color="primaryLight"
                      variant="filled"
                      sx={{
                        width: { lg: '15em', md: '10em' },
                        backgroundColor: '#fafafa',
                        '& .MuiFilledInput-root': {
                          backgroundColor: '#fafafa',
                        },
                      }}
                      {...params}
                    />
                  )}
                />
              </Stack>
              <Stack direction="row" gap={4} pr="20px">
                <Tooltip title="Open fullscreen">
                  <WhiteButton
                    size="small"
                    onClick={() => navigate(`../overview/${id}`)}
                    sx={{ background: theme.palette.neutral.lightBlue }}
                  >
                    <CallMade
                      fontSize="small"
                      sx={{ color: theme.palette.primary.light }}
                    />
                  </WhiteButton>
                </Tooltip>
                <Tooltip title={deadlineConfig.tooltip}>
                  <WhiteButton
                    size="small"
                    sx={{ background: deadlineConfig.bgColor, gap: '2px', minWidth: '52px', maxWidth: '60px' }}
                  >
                    <TimerOutlined
                      fontSize="small"
                      sx={{ color: deadlineConfig.color }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: deadlineConfig.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    >
                      {deadlineConfig.label}
                    </Typography>
                  </WhiteButton>
                </Tooltip>
                <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
                  <WhiteButton
                    size="small"
                    onClick={() => setExpanded((expanded) => !expanded)}
                    sx={{ background: theme.palette.neutral.lightBlue }}
                  >
                    {expanded ? (
                      <KeyboardArrowUp
                        fontSize="small"
                        sx={{ color: theme.palette.primary.light }}
                      />
                    ) : (
                      <KeyboardArrowDown
                        fontSize="small"
                        sx={{ color: theme.palette.primary.light }}
                      />
                    )}
                  </WhiteButton>
                </Tooltip>
              </Stack>
            </Stack>
            {
              <LinearProgressWithLabel
                color="primary"
                value={
                  (getCompletedTaskAmount() / projectTasks.length) * 100 || 0
                }
                width="80%"
                variant="determinate"
                visibility={expanded ? 'hidden' : 'visible'}
              />
            }
          </Stack>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: '17px',
            pt: '17px',
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <TaskProgress tasks={projectTasks} sx={{ pt: '32px' }} projectId={id} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ProjectAccordionManagerView;
