import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useSelector } from 'react-redux';

/**
 * Shows a toast notification when async thunks fail.
 * Listens to Redux state for data errors.
 */
const GlobalErrorToast = () => {
  const { dataError } = useSelector((state) => state.projectmap);
  const { error: authError } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const error = dataError || authError;
    if (error) {
      setMessage(typeof error === 'string' ? error : 'An error occurred');
      setOpen(true);
    }
  }, [dataError, authError]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalErrorToast;
