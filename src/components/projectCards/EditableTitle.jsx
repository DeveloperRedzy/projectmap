import React, { useRef, useState } from 'react';
import {
  InputAdornment,
  Stack,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import styled from '@emotion/styled/macro';
import { Done, Edit } from '@mui/icons-material';

const HoverIconButton = styled(IconButton)`
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s linear;

  /* Touch devices have no hover — keep the control reachable. */
  @media (hover: none) {
    visibility: visible;
    opacity: 1;
  }
`;

const Container = styled('div')`
  width: 100%;
  :hover ${HoverIconButton} {
    visibility: visible;
    opacity: 1;
  }
`;

const EditableTitle = ({
  title,
  onEnterDown,
  sx,
  editingSx,
  typographyVariant,
  borderColor,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);
  const textInput = useRef(null);

  const handleOnBlur = () => {
    onEnterDown(text);
    setEditing(false);
    textInput.current.blur();
  };

  const handleKeyPress = (key) => {
    if (key.keyCode !== 13) return;
    handleOnBlur();
  };

  return (
    <Container>
      {editing ? (
        <TextField
          autoFocus
          sx={{
            ...editingSx,
          }}
          value={text}
          color={borderColor}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(key) => handleKeyPress(key)}
          onFocus={(e) => {
            e.target.select();
          }}
          onBlur={handleOnBlur}
          onClick={(e) => e.stopPropagation()}
          inputRef={textInput}
          InputProps={{
            endAdornment: (
              <InputAdornment position={'end'}>
                <IconButton edge="end">
                  <Done sx={{ color: editingSx?.input?.color || '' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <Stack gap={1} direction="row" display="flex">
          <Typography
            sx={{ alignSelf: 'center', ...sx }}
            variant={typographyVariant}
          >
            {text}
          </Typography>
          <HoverIconButton
            size="small"
            sx={{
              width: '1.75em',
              height: '1.75em',
              alignSelf: 'center',
            }}
            onClick={(e) => {
              setEditing(true);
              e.stopPropagation();
            }}
          >
            <Edit
              sx={{ color: editingSx?.input?.color || 'black' }}
              fontSize="small"
            />
          </HoverIconButton>
        </Stack>
      )}
    </Container>
  );
};

export default EditableTitle;
