import React, { useState, useMemo, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  Container,
  IconButton,
  Collapse,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import ProjectListManagerView from './ProjectListManagerView';

const TASK_STATUS_OPTIONS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
];

const ManagerView = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
  }, []);

  const filters = useMemo(
    () => ({
      searchQuery: searchQuery.toLowerCase().trim(),
      statusFilter,
    }),
    [searchQuery, statusFilter],
  );

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <Container
      disableGutters
      sx={{ maxWidth: '1080px' }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <Grid
          container
          sx={{
            display: 'flex',
            flexGrow: 1,
            pt: '32px',
            px: '1.5vw',
            pb: '24px',
            alignItems: 'center',
          }}
        >
          <Grid item xs={11}>
            <Typography
              sx={{
                fontSize: '34px',
                letterSpacing: 0.25,
                lineHeight: '42px',
              }}
            >
              Manager View
            </Typography>
          </Grid>
          <Grid
            item
            xs={1}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <IconButton
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-label="Toggle filters"
              sx={{
                color: hasActiveFilters ? 'primary.light' : 'inherit',
              }}
            >
              <FilterList sx={{ width: '35px', height: '35px' }} />
            </IconButton>
          </Grid>
        </Grid>

        <Collapse in={filterOpen} sx={{ width: '100%', px: '1.5vw' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{
              pb: 3,
              px: '1.5vw',
              alignItems: { sm: 'center' },
            }}
          >
            <TextField
              size="small"
              label="Search projects"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Task Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Task Status"
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <IconButton
                size="small"
                onClick={handleClearFilters}
                aria-label="Clear filters"
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Collapse>

        <Grid container sx={{ p: 0 }}>
          <Grid item xs={12}>
            <ProjectListManagerView filters={filters} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ManagerView;
