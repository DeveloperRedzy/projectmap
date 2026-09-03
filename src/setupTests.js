// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Tests must not depend on a local .env (CI has none). Suites that
// transitively import supabaseClient get safe placeholders; anything that
// would actually touch the network is mocked per-suite.
process.env.REACT_APP_SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
process.env.REACT_APP_SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-anon-key';
