import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useUpdateTask } from '../queries/useTasks';

const EditTaskModal = ({ open, onClose, taskId, currentText }) => {
  const updateTask = useUpdateTask();
  const [text, setText] = useState(currentText);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    updateTask.mutate({ id: taskId, data: { text: trimmed } });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Task text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskModal;
