import React from 'react';
import {
  Stack,
  useMediaQuery,
  styled,
  Typography,
  Button,
} from '@mui/material';
import { Link } from 'react-scroll';

const MainTitle = styled(Typography)`
  font-size: clamp(32px, 6vw, 47px);
  font-weight: 700;
  max-width: 429px;
  line-height: 1.2;
  padding-bottom: 36px;
  color: #444791;
`;

const MainDescription = styled(Typography)`
  font-size: 14px;
  font-weight: 400;
  max-width: 356px;
  max-height: 60px;
  line-height: 20px;
  letter-spacing: 0.15px;
  padding-bottom: 31px;
  color: #3e3e3e;
`;

const ScrollButton = styled(Button)`
  width: 113px;
  height: 30px;
  padding: 0;
`;

const ScrollButtonText = styled(Typography)`
  font-size: 13px;
  font-weight: 500;
  height: 22px;
  line-height: 22px;
  letter-spacing: 0.137px;
`;

const StartPageContent = () => {
  const minSize = useMediaQuery('(max-width: 600px)');

  return (
    <Stack>
      <MainTitle id="title1">Run your projects like a Pro</MainTitle>
      <MainDescription>
        Map your projects within 10 minutes. Get an instant overview to control
        the progress.
      </MainDescription>
      <Stack direction={minSize ? 'column' : 'row'}>
        <Link
          activeClass="title1"
          to="title2"
          spy={true}
          smooth={true}
          offset={50}
          duration={500}
        >
          <ScrollButton variant="outlined">
            <ScrollButtonText>SCROLL DOWN</ScrollButtonText>
          </ScrollButton>
        </Link>
      </Stack>
    </Stack>
  );
};

export default StartPageContent;
