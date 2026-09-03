import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

const TimeLineSliderGrid = styled(Grid)(({ theme }) => ({
  top: '64px',
  position: 'fixed',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  paddingTop: '60px',
  paddingLeft: '30px',
  paddingRight: '30px',
  paddingBottom: '25px',
}));

const TimeLineSliderGridProjects = styled(Grid)(({ theme }) => ({
  top: '64px',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  padding: '40px',
  paddingTop: '60px',
}));

export { TimeLineSliderGrid, TimeLineSliderGridProjects };
