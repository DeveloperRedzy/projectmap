import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

/** Generic "are you sure?" dialog for destructive actions. */
const ConfirmDeleteDialog = ({ open, onClose, onConfirm, title, message }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        color="error"
        variant="contained"
        onClick={() => {
          onConfirm();
          onClose();
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDeleteDialog;
