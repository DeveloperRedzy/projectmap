import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { createProject } from '../slices/projectmapSlice';
import { useDispatch, useSelector } from 'react-redux';
import { WhiteButton } from './ButtonStyles';
import { Close, Done } from '@mui/icons-material';

const AddProject = ({ sx, setIsAdding, setLastAdded }) => {
  const theme = useTheme();
  const isLessThanMd = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitError, setSubmitError] = useState(false);

  const handleNameChange = (e) => setName(e.target.value);

  const updateStartDate = (newDate) => {
    setStartDate(newDate.toString());
  };

  const updateEndDate = (newDate) => {
    setEndDate(newDate.toString());
  };

  const handleSubmit = async () => {
    if (name && startDate && endDate) {
      const result = await dispatch(
        createProject({
          name,
          start_date: startDate,
          end_date: endDate,
          created_by: user?.id,
        }),
      ).unwrap();
      setLastAdded(result.id);
      setSubmitError(false);
      setIsAdding(false);
      return;
    }
    setSubmitError(true);
  };

  const handleCancel = () => {
    setStartDate(null);
    setEndDate(null);
    setName('');
    setIsAdding(false);
  };

  return (
    <Stack
      direction={isLessThanMd ? 'column' : 'row'}
      gap={isLessThanMd ? 5 : 8}
      p={isLessThanMd ? '3% 0 3% 0' : ''}
      alignItems={'center'}
      sx={{ ...sx }}
    >
      <TextField
        variant="filled"
        label="Project Title"
        size="small"
        value={name}
        color="primaryLight"
        onChange={handleNameChange}
        error={!name && submitError}
        sx={{ width: { lg: '25em', md: '20em', xs: '85%' }, flexGrow: 1 }}
      />
      <DatePicker
        maxDate={endDate ? new Date(endDate) : null}
        onChange={updateStartDate}
        value={startDate}
        label="Start"
        inputFormat="DD/MM/YYYY"
        renderInput={(params) => (
          <TextField
            size="small"
            color="primaryLight"
            variant="filled"
            placeholder="SX Only"
            sx={{ width: { lg: '15em', md: '10em', xs: '85%' } }}
            {...params}
            error={!startDate && submitError}
          />
        )}
      />
      <DatePicker
        minDate={startDate ? new Date(startDate) : null}
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
              width: {
                lg: '15em',
                md: '10em',
                xs: '85%',
              },
            }}
            {...params}
            error={!endDate && submitError}
          />
        )}
      />
      <Stack direction="row" gap={4}>
        <Tooltip title="Create Project">
          <WhiteButton
            size="small"
            onClick={handleSubmit}
            sx={{ backgroundColor: '#edf7ed' }}
          >
            <Done fontSize="small" sx={{ color: '#5fb760' }} />
          </WhiteButton>
        </Tooltip>
        <Tooltip title="Cancel">
          <WhiteButton
            size="small"
            onClick={handleCancel}
            sx={{ backgroundColor: '#fcedec' }}
          >
            <Close fontSize="small" sx={{ color: '#f16460' }} />
          </WhiteButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default AddProject;
