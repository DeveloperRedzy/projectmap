import { configureStore } from '@reduxjs/toolkit';
import projectmapReducer, {
  setPMDrawerOpened,
  setAlertOpened,
} from '../slices/projectmapSlice';

// Mock the API modules to prevent actual Supabase calls
jest.mock('../api/projectsApi', () => ({}));
jest.mock('../api/phasesApi', () => ({}));
jest.mock('../api/categoriesApi', () => ({}));
jest.mock('../api/tasksApi', () => ({}));
jest.mock('../api/membersApi', () => ({}));

const createTestStore = (preloadedState) =>
  configureStore({
    reducer: { projectmap: projectmapReducer },
    preloadedState: preloadedState
      ? { projectmap: preloadedState }
      : undefined,
  });

describe('projectmapSlice', () => {
  describe('sync reducers', () => {
    test('should return initial state', () => {
      const store = createTestStore();
      const state = store.getState().projectmap;
      expect(state.drawerOpened).toBe(false);
      expect(state.projects).toEqual([]);
      expect(state.users).toEqual([]);
      expect(state.alertOpened).toBe(false);
      expect(state.dataStatus).toBe('idle');
    });

    test('setPMDrawerOpened should toggle drawer', () => {
      const store = createTestStore();
      store.dispatch(setPMDrawerOpened(true));
      expect(store.getState().projectmap.drawerOpened).toBe(true);

      store.dispatch(setPMDrawerOpened(false));
      expect(store.getState().projectmap.drawerOpened).toBe(false);
    });

    test('setAlertOpened should toggle alert', () => {
      const store = createTestStore();
      store.dispatch(setAlertOpened(true));
      expect(store.getState().projectmap.alertOpened).toBe(true);

      store.dispatch(setAlertOpened(false));
      expect(store.getState().projectmap.alertOpened).toBe(false);
    });
  });

  describe('async thunk state transitions', () => {
    test('loadAllData.pending should set status to loading', () => {
      const store = createTestStore();
      // Dispatch the pending action directly
      store.dispatch({ type: 'projectmap/loadAllData/pending' });
      expect(store.getState().projectmap.dataStatus).toBe('loading');
      expect(store.getState().projectmap.dataError).toBeNull();
    });

    test('loadAllData.fulfilled should populate state', () => {
      const store = createTestStore();
      const mockPayload = {
        projects: [{ id: '1', name: 'Test', start_date: '2026-01-01', end_date: '2026-12-31' }],
        members: [],
      };

      store.dispatch({
        type: 'projectmap/loadAllData/fulfilled',
        payload: mockPayload,
      });

      const state = store.getState().projectmap;
      expect(state.dataStatus).toBe('succeeded');
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].name).toBe('Test');
    });

    test('loadAllData.rejected should set error state', () => {
      const store = createTestStore();
      store.dispatch({
        type: 'projectmap/loadAllData/rejected',
        payload: 'Network error',
      });

      const state = store.getState().projectmap;
      expect(state.dataStatus).toBe('failed');
      expect(state.dataError).toBe('Network error');
    });

    test('createProject.fulfilled should add project to state', () => {
      const store = createTestStore();
      store.dispatch({
        type: 'projectmap/createProject/fulfilled',
        payload: { id: 'new-1', name: 'New Project', start_date: '2026-01-01', end_date: '2026-06-01' },
      });

      expect(store.getState().projectmap.projects).toHaveLength(1);
      expect(store.getState().projectmap.projects[0].name).toBe('New Project');
    });

    test('deleteProject.fulfilled should remove project and related data', () => {
      const store = createTestStore({
        drawerOpened: false,
        alertOpened: false,
        dataStatus: 'succeeded',
        dataError: null,
        projects: [{ id: 'p1', name: 'Project' }],
        users: [{ id: 'u1', projectId: 'p1' }, { id: 'u2', projectId: 'other' }],
      });

      store.dispatch({
        type: 'projectmap/deleteProject/fulfilled',
        payload: 'p1',
      });

      const state = store.getState().projectmap;
      expect(state.projects).toHaveLength(0);
      expect(state.users).toHaveLength(1);
      expect(state.users[0].id).toBe('u2');
    });
  });
});
