import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import { Delete, ExpandMore } from '@mui/icons-material';
import styled from '@emotion/styled/macro';
import { useUpdatePhase, useDeletePhase } from '../../queries/usePhases';
import EditableTitle from './EditableTitle';
import EditableDate from './EditableDate';
import ConfirmDeleteDialog from '../ConfirmDeleteDialog';

const HoverDeleteButton = styled(IconButton)`
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s linear;

  /* Touch devices have no hover — keep the control reachable. */
  @media (hover: none) {
    visibility: visible;
    opacity: 1;
  }
`;

const HeaderRow = styled(Stack)`
  width: 100%;

  :hover ${HoverDeleteButton} {
    visibility: visible;
    opacity: 1;
  }
`;

export const PrimaryCard = ({
  phaseId,
  projectId,
  name,
  completedTasks,
  totalTasks,
  expanded,
  setExpanded,
  sx,
  dueDate,
  isManager = false,
}) => {
  const theme = useTheme();
  const updatePhase = useUpdatePhase();
  const deletePhase = useDeletePhase();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleEnterPress = (value) => {
    updatePhase.mutate({ id: phaseId, data: { name: value } });
  };

  return (
    <Accordion
      expanded={expanded}
      sx={{
        background: theme.palette.primary.light,
        ...sx,
        '& .Mui-focusVisible': {
          backgroundColor: '#1876d1 !important',
        },
      }}
    >
      <AccordionSummary
        sx={{ p: '0 1em 0.5em 1em' }}
        expandIcon={
          <IconButton onClick={() => setExpanded((expanded) => !expanded)}>
            <ExpandMore
              sx={{
                color: 'white',
                display: 'flex',
              }}
            />
          </IconButton>
        }
      >
        <Stack spacing={1.5} width="100%">
          <HeaderRow direction="row" alignItems="center">
            <EditableTitle
              title={name}
              onEnterDown={handleEnterPress}
              typographyVariant={'h5'}
              borderColor={'primaryTextBox'}
              sx={{
                color: 'white',
              }}
              editingSx={{
                input: {
                  color: 'white',
                  fontWeight: 600,
                },
              }}
            />
            {isManager && (
              <Tooltip title="Delete milestone">
                <HoverDeleteButton
                  size="small"
                  aria-label={`Delete milestone ${name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                >
                  <Delete
                    fontSize="small"
                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                </HoverDeleteButton>
              </Tooltip>
            )}
          </HeaderRow>
          <EditableDate
            phaseId={phaseId}
            projectId={projectId}
            date={dueDate}
            typographyVariant={'h7'}
            borderColor={'primaryTextBox'}
            sx={{
              color: 'white',
            }}
            editingSx={{
              input: {
                color: 'white',
                fontWeight: 600,
              },
            }}
          />
          <Stack spacing={2} width="100%">
            <Typography color="white">{`${completedTasks}/${totalTasks} Tasks completed`}</Typography>
            <LinearProgress
              color="success"
              width="80%"
              sx={{ background: 'white' }}
              variant="determinate"
              value={(completedTasks / totalTasks) * 100 || 0}
            />
          </Stack>
        </Stack>
      </AccordionSummary>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deletePhase.mutate(phaseId)}
        title="Delete milestone?"
        message={`"${name}" and all of its outcomes and tasks will be permanently deleted.`}
      />
    </Accordion>
  );
};

export default PrimaryCard;
