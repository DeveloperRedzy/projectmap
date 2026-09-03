import styled from '@emotion/styled/macro';
import { Box } from '@mui/material';

const ModalHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.palette.background.default};
  padding: 12px;
`;

const ModalMain = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 20px;
  max-height: 450px;
`;

const ModalFooter = styled(Box)`
  display: flex;
  justify-content: end;
  padding: 12px;
  background-color: ${(props) => props.theme.palette.background.default};
`;

export { ModalHeader, ModalMain, ModalFooter };
