import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Delete, ExpandMore } from '@mui/icons-material';
import styled from '@emotion/styled/macro';

import Task from './Task';
import { useTasks, useCreateTask } from '../../queries/useTasks';
import { useUpdateCategory, useDeleteCategory } from '../../queries/useCategories';
import EditableTitle from './EditableTitle';
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

export const SecondaryCard = ({ name, categoryId, phaseId, sx, expanded, isManager = true }) => {
  const theme = useTheme();
  const { data: tasks = [] } = useTasks();
  const createTask = useCreateTask();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const categoryTasks = tasks.filter((task) => task.categoryId === categoryId);

  const [text, setText] = useState('');
  const [secondExpanded, setSecondExpanded] = useState(expanded);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAddTask = () => {
    if (!text) return;
    createTask.mutate({
      text,
      category_id: categoryId,
      completed: 0,
    });
    setText('');
  };

  const handleEnterPress = (value) => {
    updateCategory.mutate({ id: categoryId, data: { name: value } });
  };

  return (
    <Accordion
      expanded={secondExpanded}
      elevation={24}
      sx={{
        ...sx,
        backgroundImage: `linear-gradient(${theme.palette.primary.light} 0.5vh, white 0 )`,
        '& .Mui-focusVisible': {
          backgroundColor: 'white !important',
        },
      }}
    >
      <AccordionSummary
        sx={{
          p: '0 1em 0.5em 1em',
        }}
        expandIcon={
          <ExpandMore
            sx={{ color: 'black' }}
            onClick={() => {
              setSecondExpanded(!secondExpanded);
            }}
          />
        }
      >
        <HeaderRow direction="row" alignItems="center">
          <EditableTitle
            title={name}
            onEnterDown={handleEnterPress}
            typographyVariant={'h5'}
            borderColor={'neutral'}
            sx={{ flexGrow: 1 }}
            editingSx={{
              input: {
                fontWeight: 600,
              },
            }}
          />
          {isManager && (
            <Tooltip title="Delete outcome">
              <HoverDeleteButton
                size="small"
                aria-label={`Delete outcome ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
              >
                <Delete fontSize="small" sx={{ color: '#f16460' }} />
              </HoverDeleteButton>
            </Tooltip>
          )}
        </HeaderRow>
      </AccordionSummary>
      <AccordionDetails sx={{ p: '0 1em 1em 1em' }}>
        <Stack spacing={2} width="100%">
          {isManager && (
            <TextField
              placeholder="+ ToDo"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              onFocus={(e) => {
                e.target.select();
              }}
            />
          )}
          <FormGroup>
            {categoryTasks.map((task) => (
              <Task
                key={task.id}
                id={task.id}
                text={task.text}
                completed={task.completed}
                categoryId={task.categoryId}
                phaseId={phaseId}
                isManager={isManager}
                assignedTo={task.assignedTo}
              />
            ))}
          </FormGroup>
        </Stack>
      </AccordionDetails>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteCategory.mutate(categoryId)}
        title="Delete outcome?"
        message={`"${name}" and all of its tasks will be permanently deleted.`}
      />
    </Accordion>
  );
};

export default SecondaryCard;
