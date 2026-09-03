import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { updateProject, deleteProject } from '../slices/projectmapSlice';
import {
  CallMade,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WhiteButton } from './ButtonStyles';
import DeleteProjectModal from './DeleteProjectModal';
import Overview from '../pages/overview/Overview';
import useProjectRole from '../util/useProjectRole';

const ProjectAccordion = ({
  id,
  name,
  endDate,
  startDate,
  summarySx,
  isExpanded,
}) => {
  const theme = useTheme();
  const isLessThanMd = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isManager } = useProjectRole(id);

  const [expanded, setExpanded] = useState(isExpanded || false);
  const [title, setTitle] = useState(name);

  const [deleteProjectModalOpened, setDeleteProjectModalOpened] =
    useState(false);

  // Re-seed the local title when the server name changes (e.g. realtime sync).
  useEffect(() => {
    setTitle(name);
  }, [name]);

  const handleClose = () => {
    setDeleteProjectModalOpened(false);
  };

  // Commit the title once (blur/Enter) instead of one API call per keystroke.
  const commitTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === name) return;
    dispatch(updateProject({ id, data: { name: trimmed } }));
  };

  const updateStartDate = (newDate) => {
    dispatch(updateProject({ id, data: { startDate: newDate.toString() } }));
  };

  const updateEndDate = (newDate) => {
    dispatch(updateProject({ id, data: { endDate: newDate.toString() } }));
  };

  const removeProject = () => {
    dispatch(deleteProject(id));
  };

  return (
    <>
      <DeleteProjectModal
        deleteProjectModalOpened={deleteProjectModalOpened}
        handleClose={handleClose}
        removeProject={removeProject}
        name={name}
      />
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
          <Stack
            direction={isLessThanMd ? 'column' : 'row'}
            gap={isLessThanMd ? 5 : 8}
            width={'100%'}
            alignItems={'center'}
          >
            <TextField
              variant="filled"
              label="Project Title"
              size="small"
              value={title}
              color="primaryLight"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              onClick={(e) => e.stopPropagation()}
              InputProps={{ readOnly: !isManager }}
              sx={{
                flexGrow: 1,
                width: { lg: '25em', md: '20em', xs: '85%' },
                backgroundColor: '#fafafa',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#fafafa',
                },
              }}
            />
            <DatePicker
              maxDate={new Date(endDate)}
              onChange={updateStartDate}
              value={startDate}
              label="Start"
              inputFormat="DD/MM/YYYY"
              disabled={!isManager}
              renderInput={(params) => (
                <TextField
                  size="small"
                  color="primaryLight"
                  variant="filled"
                  placeholder="SX Only"
                  sx={{
                    width: { lg: '15em', md: '10em', xs: '85%' },
                    backgroundColor: '#fafafa',
                    '& .MuiFilledInput-root': {
                      backgroundColor: '#fafafa',
                    },
                  }}
                  {...params}
                />
              )}
            />
            <DatePicker
              minDate={new Date(startDate)}
              onChange={updateEndDate}
              value={endDate}
              label="End"
              inputFormat="DD/MM/YYYY"
              disabled={!isManager}
              renderInput={(params) => (
                <TextField
                  size="small"
                  color="primaryLight"
                  variant="filled"
                  sx={{
                    width: {
                      lg: '15em',
                      md: '10em',
                      xs: '85%',
                    },
                    backgroundColor: '#fafafa',
                    '& .MuiFilledInput-root': {
                      backgroundColor: '#fafafa',
                    },
                  }}
                  {...params}
                />
              )}
            />
            <Stack direction="row" gap={4}>
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
              {isManager && (
                <Tooltip title="Delete Project">
                  <WhiteButton
                    size="small"
                    onClick={() => setDeleteProjectModalOpened(true)}
                    sx={{ backgroundColor: '#fcedec' }}
                  >
                    <Delete fontSize="small" sx={{ color: '#f16460' }} />
                  </WhiteButton>
                </Tooltip>
              )}
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
        </AccordionSummary>
        <AccordionDetails>
          <Overview projectId={id} fixed={false} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ProjectAccordion;
