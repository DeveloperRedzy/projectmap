import React, { useRef, useState } from 'react';
import {
  InputAdornment,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import styled from '@emotion/styled/macro';
import { Done, Edit } from '@mui/icons-material';
import { useUpdatePhase } from '../../queries/usePhases';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { printDate } from '../../util/printDate';
import { addDays } from '../../util/addDays';

const HoverIconButton = styled(IconButton)`
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s linear;

  /* Touch devices have no hover — keep the control reachable. */
  @media (hover: none) {
    visibility: visible;
    opacity: 1;
  }
`;

const Container = styled('div')`
  width: 100%;

  :hover ${HoverIconButton} {
    visibility: visible;
    opacity: 1;
  }
`;

const EditableDate = ({
  date,
  sx,
  editingSx,
  typographyVariant,
  borderColor,
  phaseId,
  projectId,
}) => {
  const updatePhase = useUpdatePhase();

  const { projects } = useSelector((state) => state.projectmap);
  const project = projects.find((project) => project.id === projectId);

  const handleDateUpdate = (value) => {
    updatePhase.mutate({ id: phaseId, data: { dueDate: value } });
  };

  const [editing, setEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [phaseDate, setPhaseDate] = useState(date);
  const textInput = useRef(null);

  const handleOnBlur = () => {
    handleDateUpdate(phaseDate);
    setEditing(false);
    textInput.current.blur();
  };

  const handleKeyPress = (key) => {
    if (key.keyCode !== 13) return;
    handleOnBlur();
  };

  return (
    <Container>
      {editing ? (
        <DatePicker
          minDate={addDays(new Date(project.startDate), 5)}
          maxDate={addDays(new Date(project.endDate), -5)}
          onChange={(newDate) => setPhaseDate(newDate)}
          value={phaseDate}
          label="Due Date"
          inputFormat="DD/MM/YYYY"
          open={pickerOpen}
          onOpen={() => setPickerOpen((open) => !open)}
          onClose={() => setPickerOpen(false)}
          inputRef={textInput}
          PopperProps={{
            onClick: (e) => e.stopPropagation(),
          }}
          renderInput={(params) => (
            <TextField
              autoFocus
              sx={{
                ...editingSx,
              }}
              onKeyDown={(key) => handleKeyPress(key)}
              onClick={(e) => e.stopPropagation()}
              color={borderColor}
              InputProps={{
                endAdornment: (
                  <InputAdornment position={'end'}>
                    <IconButton edge="end">
                      <Done sx={{ color: editingSx?.input?.color || '' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...params}
            />
          )}
        />
      ) : (
        <Stack gap={1} direction="row" display="flex">
          <Typography
            sx={{ alignSelf: 'center', ...sx }}
            variant={typographyVariant}
          >
            {printDate(phaseDate)}
          </Typography>
          <HoverIconButton
            size="small"
            sx={{
              width: '1.75em',
              height: '1.75em',
              alignSelf: 'center',
            }}
            onClick={(e) => {
              setEditing(true);
              e.stopPropagation();
            }}
          >
            <Edit
              sx={{ color: editingSx?.input?.color || 'black' }}
              fontSize="small"
            />
          </HoverIconButton>
        </Stack>
      )}
    </Container>
  );
};

export default EditableDate;
