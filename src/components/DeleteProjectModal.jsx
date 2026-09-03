import React from 'react';
import {
  Button,
  Dialog,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setAlertOpened } from '../slices/projectmapSlice';
import {ModalFooter, ModalHeader, ModalMain} from "./Modal/SitemapModalStyle";

const DeleteProjectModal = ({
  deleteProjectModalOpened,
  handleClose,
  removeProject,
  name,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const handleAlertOpened = () => {
    dispatch(setAlertOpened(true));
    removeProject();
  };

  return (
    <>
      <Dialog
        open={deleteProjectModalOpened}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
      >
        <ModalHeader>
          <Typography flexGrow={1} variant="h4">
            Are you sure?
          </Typography>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </ModalHeader>
        <ModalMain>Do you really want to delete the project {name}</ModalMain>
        <ModalFooter>
          <Button
            variant="contained"
            sx={{
              mr: 4,
              color: theme.palette.primary.light,
              backgroundColor: theme.palette.neutral.lightBlue,
              ':hover': {
                color: theme.palette.primary.light,
                backgroundColor: theme.palette.neutral.lightBlue,
              },
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              color: '#f16460',
              backgroundColor: '#fcedec',
              ':hover': {
                color: '#f16460',
                backgroundColor: '#fcedec',
              },
            }}
            onClick={handleAlertOpened}
          >
            Delete
          </Button>
        </ModalFooter>
      </Dialog>
    </>
  );
};

export default DeleteProjectModal;
