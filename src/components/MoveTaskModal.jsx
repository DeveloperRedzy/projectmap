import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useMoveTask } from '../queries/useTasks';
import { usePhases } from '../queries/usePhases';
import { useCategories } from '../queries/useCategories';

const MoveTaskModal = ({ open, onClose, taskId, currentPhaseId, currentCategoryId }) => {
  const moveTask = useMoveTask();
  const { data: phases = [] } = usePhases();
  const { data: categories = [] } = useCategories();

  const [selectedPhaseId, setSelectedPhaseId] = useState(currentPhaseId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(currentCategoryId);

  const availableCategories = categories.filter(
    (category) => category.phaseId === selectedPhaseId,
  );

  const handlePhaseChange = (e) => {
    setSelectedPhaseId(e.target.value);
    const firstCategory = categories.find(
      (category) => category.phaseId === e.target.value,
    );
    setSelectedCategoryId(firstCategory ? firstCategory.id : '');
  };

  const handleSave = () => {
    if (!selectedCategoryId || !selectedPhaseId) return;
    if (
      selectedCategoryId === currentCategoryId &&
      selectedPhaseId === currentPhaseId
    ) {
      onClose();
      return;
    }

    moveTask.mutate({
      id: taskId,
      data: { categoryId: selectedCategoryId, phaseId: selectedPhaseId },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Move Task</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Milestone</InputLabel>
            <Select
              value={selectedPhaseId}
              onChange={handlePhaseChange}
              label="Milestone"
            >
              {phases.map((phase) => (
                <MenuItem key={phase.id} value={phase.id}>
                  {phase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Outcome</InputLabel>
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              label="Outcome"
            >
              {availableCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveTaskModal;
