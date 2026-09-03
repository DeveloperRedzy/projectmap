import React, { useState } from 'react';
import {
  Avatar,
  Card,
  useTheme,
  Paper,
  TableRow,
  TableHead,
  TableContainer,
  TableCell,
  TableBody,
  Table,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  DriveFileMove,
  Delete,
  CheckCircleOutline,
  ChatBubbleOutline,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { printDate } from '../../util/printDate';
import { useToggleTask, useDeleteTask } from '../../queries/useTasks';
import { useCategories } from '../../queries/useCategories';
import { usePhases } from '../../queries/usePhases';
import EditTaskModal from '../EditTaskModal';
import MoveTaskModal from '../MoveTaskModal';
import AssignTaskPicker from '../AssignTaskPicker';
import TaskCommentThread from '../TaskCommentThread';
import { getInitials } from '../../util/getInitials';

const TaskActionMenu = ({ task }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useCategories();
  const toggleTask = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const taskCategory = categories.find((c) => c.id === task.categoryId);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleToggleComplete = () => {
    toggleTask.mutate({ id: task.id, userId: user?.id });
    setAnchorEl(null);
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate(task.id);
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Task actions"
      >
        <MoreVert sx={{ color: theme.palette.secondary.backgroundBlue }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ disablePadding: true }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setEditOpen(true);
          }}
        >
          <Edit sx={{ mr: 2, fontSize: '1.1rem' }} color="primary" />
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setMoveOpen(true);
          }}
        >
          <DriveFileMove sx={{ mr: 2, fontSize: '1.1rem' }} color="primary" />
          <Typography variant="body2">Move</Typography>
        </MenuItem>
        <MenuItem onClick={handleToggleComplete}>
          <CheckCircleOutline
            sx={{ mr: 2, fontSize: '1.1rem' }}
            color={task.completed === 100 ? 'success' : 'action'}
          />
          <Typography variant="body2">
            {task.completed === 100 ? 'Mark Incomplete' : 'Mark Complete'}
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setCommentsOpen(true);
          }}
        >
          <ChatBubbleOutline sx={{ mr: 2, fontSize: '1.1rem' }} color="primary" />
          <Typography variant="body2">Comments</Typography>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 2, fontSize: '1.1rem', color: '#f16460' }} />
          <Typography variant="body2" color="#f16460">
            Delete
          </Typography>
        </MenuItem>
      </Menu>

      <EditTaskModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        taskId={task.id}
        currentText={task.text}
      />
      <MoveTaskModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        taskId={task.id}
        currentPhaseId={taskCategory?.phaseId}
        currentCategoryId={task.categoryId}
      />
      <TaskCommentThread
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        taskId={task.id}
        taskText={task.text}
      />
    </>
  );
};

const AccordionDetailsTable = ({ tableTasks, projectId }) => {
  const theme = useTheme();
  const { users } = useSelector((state) => state.projectmap);
  const { data: categories = [] } = useCategories();
  const { data: phases = [] } = usePhases();

  const getUserById = (userId) => users.find((user) => user.id === userId);

  return (
    <Card>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="task details table">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell align="left">Milestone</TableCell>
              <TableCell align="left">Outcome</TableCell>
              <TableCell align="left">Assigned</TableCell>
              <TableCell align="left">Due Date</TableCell>
              <TableCell align="left">Completed By</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableTasks.map((task) => {
              const category = categories.find(
                (i) => i.id === task.categoryId,
              );
              const milestone = category
                ? phases.find((i) => i.id === category.phaseId)
                : null;
              const completedByUser = task.completedBy
                ? getUserById(task.completedBy)
                : null;

              if (!category || !milestone) return null;

              return (
                <TableRow
                  key={task.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ width: '389px', borderBottom: 0 }}
                  >
                    <Typography
                      sx={{
                        fontSize: '14px',
                        textDecoration:
                          task.completed === 100 ? 'line-through' : 'none',
                      }}
                    >
                      {task.text}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '143px', borderBottom: 0 }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>
                      {milestone?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '143px', borderBottom: 0 }}
                  >
                    {category.name}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '143px', borderBottom: 0 }}
                  >
                    <AssignTaskPicker
                      taskId={task.id}
                      assignedTo={task.assignedTo}
                      projectId={projectId}
                    />
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '143px', borderBottom: 0 }}
                  >
                    {milestone ? printDate(milestone.dueDate) : '—'}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '143px', borderBottom: 0 }}
                  >
                    {completedByUser ? (
                      <Tooltip
                        title={`${completedByUser.firstName} ${completedByUser.lastName}`}
                      >
                        <Avatar
                          src={completedByUser.img}
                          sx={{
                            background: theme.palette.success.main,
                            color: theme.palette.background.default,
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                          }}
                        >
                          {getInitials(
                            completedByUser.firstName,
                            completedByUser.lastName,
                          )}
                        </Avatar>
                      </Tooltip>
                    ) : (
                      <Typography
                        sx={{ fontSize: '13px', color: theme.palette.neutral.main }}
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ width: '80px', borderBottom: 0 }}
                  >
                    <TaskActionMenu task={task} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default AccordionDetailsTable;
