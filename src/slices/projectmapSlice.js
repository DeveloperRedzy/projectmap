import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchProjects,
  createProject as createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from '../api/projectsApi';
import {
  fetchProjectMembers,
} from '../api/membersApi';

// Phases, categories and tasks live in React Query (src/queries/*). This slice
// holds projects + members (server state still on Redux) plus UI state
// (drawer/alert). Members migrate next.

// =============================================
// ASYNC THUNKS
// =============================================

// Load projects + their members for the current user.
export const loadAllData = createAsyncThunk(
  'projectmap/loadAllData',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await fetchProjects();
      const membersArrays = await Promise.all(
        projects.map((p) => fetchProjectMembers(p.id)),
      );
      const allMembers = membersArrays.flat();
      return { projects, members: allMembers };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Load members for a specific project
export const loadProjectMembers = createAsyncThunk(
  'projectmap/loadProjectMembers',
  async (projectId, { rejectWithValue }) => {
    try {
      const members = await fetchProjectMembers(projectId);
      return { projectId, members };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Projects
export const createProject = createAsyncThunk(
  'projectmap/createProject',
  async (project, { rejectWithValue }) => {
    try {
      const data = await createProjectApi(project);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProject = createAsyncThunk(
  'projectmap/updateProject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Map frontend field names to database column names
      const dbData = {};
      if (data.name !== undefined) dbData.name = data.name;
      if (data.startDate !== undefined) dbData.start_date = data.startDate;
      if (data.endDate !== undefined) dbData.end_date = data.endDate;
      const result = await updateProjectApi(id, dbData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteProject = createAsyncThunk(
  'projectmap/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProjectApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// =============================================
// HELPER: Map DB row to frontend format
// =============================================
const mapProject = (p) => ({
  id: p.id,
  name: p.name,
  startDate: p.start_date,
  endDate: p.end_date,
  createdBy: p.created_by,
});

const mapMember = (m) => ({
  id: m.user_id,
  firstName: m.profiles?.first_name || '',
  lastName: m.profiles?.last_name || '',
  role: m.role,
  img: m.profiles?.avatar_url || '',
  projectId: m.project_id,
});

// =============================================
// SLICE
// =============================================
const initialState = {
  drawerOpened: false,
  projects: [],
  users: [],
  alertOpened: false,
  dataStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  dataError: null,
};

export const projectMap = createSlice({
  name: 'projectmap',
  initialState,
  reducers: {
    setPMDrawerOpened: (state, action) => {
      state.drawerOpened = action.payload;
    },
    setAlertOpened: (state, action) => {
      state.alertOpened = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load all data
      .addCase(loadAllData.pending, (state) => {
        state.dataStatus = 'loading';
        state.dataError = null;
      })
      .addCase(loadAllData.fulfilled, (state, action) => {
        state.dataStatus = 'succeeded';
        state.projects = action.payload.projects.map(mapProject);
        state.users = action.payload.members.map(mapMember);
      })
      .addCase(loadAllData.rejected, (state, action) => {
        state.dataStatus = 'failed';
        state.dataError = action.payload;
      })

      // Load project members
      .addCase(loadProjectMembers.fulfilled, (state, action) => {
        const { members } = action.payload;
        const mapped = members.map(mapMember);
        // Remove old members for this project, add new ones
        const otherUsers = state.users.filter(
          (u) => u.projectId !== action.payload.projectId,
        );
        state.users = [...otherUsers, ...mapped];
      })

      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects = [mapProject(action.payload), ...state.projects];
      })

      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const updated = mapProject(action.payload);
        state.projects = state.projects.map((p) =>
          p.id === updated.id ? updated : p,
        );
      })

      // Delete project (DB CASCADE removes children; the phases/categories/
      // tasks queries self-heal via realtime invalidation).
      .addCase(deleteProject.fulfilled, (state, action) => {
        const id = action.payload;
        state.users = state.users.filter((u) => u.projectId !== id);
        state.projects = state.projects.filter((p) => p.id !== id);
      });
  },
});

export const {
  setPMDrawerOpened,
  setAlertOpened,
} = projectMap.actions;

export default projectMap.reducer;
