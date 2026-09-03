import { useEffect, useMemo } from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@mui/system';
import { useDispatch } from 'react-redux';
import routes from './routes';
import createTheme from './themes';
import { THEMES } from './constants/themes';
import { supabase } from './api/supabaseClient';
import { setSession } from './redux/slices/authSlice';

function App() {
  const content = useRoutes(routes);
  const theme = useMemo(() => createTheme(THEMES.DEFAULT), []);
  const dispatch = useDispatch();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      {content}
    </ThemeProvider>
  );
}

export default App;
