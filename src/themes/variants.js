import merge from 'deepmerge';
import { THEMES } from '../constants/themes';

const customBlue = {
  50: '#e9f0fb',
  100: '#c8daf4',
  200: '#a3c1ed',
  300: '#7ea8e5',
  400: '#6395e0',
  500: '#4782da',
  600: '#407ad6',
  700: '#376fd0',
  800: '#2f65cb',
  900: '#2052c2 ',
};

const bloola = {
  primary: '#0045AC',
  primaryLight: '#1976D2',
  secondary: {
    one: '#1e19bd',
    two: '#49e1f2',
    three: '#1976D2',
  },
  semantic: {
    error: '#f87467',
    warning: '#FF9800',
    success: '#78caa4',
    successLight: '#4BB14F',
    info: '#73b1ff',
    disabled: {
      one: '#f3f3f3',
      two: '#8a8a8a',
    },
    black: '#000',
    white: '#fff',
    lightGreen: '',
  },
  neutral: {
    primary: '#767676',
    active: '#748091',
    disabled: '#f5f7fa',
    empty: '#ffffff',
    lightBlue: '#EEF4FD',
    light: '#EFEFEF',
    lightGray: '#E6E6E6',
  },
  grayscale: {
    1: '#000000',
    2: '#35414c',
    3: '#66737f',
    4: '#8f9ca9',
    5: '#adb9c7',
    6: '#b8c1cc',
    7: '#d5dde5',
    8: '#e7ecf2',
    9: '#eef2f6',
    10: '#ffffff',
  },
};

const defaultVariant = {
  name: THEMES.DEFAULT,
  palette: {
    mode: 'light',
    primary: {
      main: bloola.primary,
      light: bloola.primaryLight,
      contrastText: '#FFF',
    },
    primaryLight: {
      main: bloola.primaryLight,
    },
    secondary: {
      main: bloola.secondary.one,
      lightBlue: bloola.secondary.two,
      backgroundBlue: bloola.secondary.three,
      contrastText: '#FFF',
    },
    secondaryLight: {
      main: bloola.secondary.two,
      light: bloola.secondary.two,
      dark: bloola.secondary.two,
      contrastText: '#FFF',
    },
    neutral: {
      main: bloola.neutral.primary,
      light: bloola.neutral.light,
      lightBlue: bloola.neutral.lightBlue,
      lightGray: bloola.neutral.lightGray,
    },
    error: {
      main: bloola.semantic.error,
    },
    success: {
      main: bloola.semantic.successLight,
      light: bloola.semantic.success,
    },
    warning: {
      main: bloola.semantic.warning,
    },
    white: '#FFF',
    background: {
      default: '#f7f9fc',
      lightBlue: customBlue['50'],
      paper: bloola.grayscale['10'],
      text: bloola.grayscale['5'],
      gray: '#f8f8f8',
    },
    border: {
      gray: '#dadada',
    },
    text: {
      primary: bloola.grayscale['1'],
      secondary: bloola.grayscale['2'],
    },
    primaryTextBox: {
      main: '#FFF',
    },
  },
};

const darkVariant = merge(defaultVariant, {
  name: THEMES.DARK,
});

const blueVariant = merge(defaultVariant, {
  name: THEMES.BLUE,
});

const variants = [defaultVariant, darkVariant, blueVariant];

export default variants;
