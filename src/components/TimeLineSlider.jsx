import React from 'react';
import { Slider } from '@mui/material';
import {
  TimeLineSliderGrid,
  TimeLineSliderGridProjects,
} from './ComponentStyles';

function valuetext(value) {
  return `${value}`;
}

const TimeLineSlider = ({ dateArray, phaseDueDates, fixed }) => {
  const dotValues = [];
  const dateValues = dateArray.map((date, index) => {
    return { date, value: (100 / dateArray.length) * index };
  });
  const marks = dateValues.map((dateValue, index) => {
    const dueDate = phaseDueDates.find((dueDate) => {
      const date = new Date(dueDate.date);
      return date.toLocaleDateString() === dateValue.date.toLocaleDateString();
    });
    let label = '';
    if (dueDate) {
      dotValues.push(dateValue.value);
      label = dueDate.phaseName;
    }
    if (index === 0) label = 'START';
    if (index === dateValues.length - 1) label = 'END';
    return { value: dateValue.value, label };
  });

  // Drop the START/END caption when a milestone label sits close enough to
  // collide with it (the milestone name is the more useful of the two).
  const COLLISION_DISTANCE = 12; // percent of the track
  const nearStart = dotValues.some((v) => v < COLLISION_DISTANCE);
  const nearEnd = dotValues.some((v) => v > 100 - COLLISION_DISTANCE);
  if (nearStart) marks[0].label = '';
  if (nearEnd && marks.length > 0) marks[marks.length - 1].label = '';

  const sliderSx = {
    '& .MuiSlider-markLabel': {
      fontSize: { xs: '10px', md: '12px' },
      maxWidth: '9em',
      whiteSpace: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
    },
  };

  return (
    <>
      {fixed ? (
        <TimeLineSliderGrid
          container
          item
          sx={{ width: '90%', maxWidth: '1280px' }}
        >
          <Slider
            track={false}
            max={100 - 100 / dateArray.length}
            step={100 / dateArray.length}
            aria-labelledby="track-false-range-slider"
            getAriaValueText={valuetext}
            value={dotValues}
            marks={marks}
            sx={sliderSx}
          />
        </TimeLineSliderGrid>
      ) : (
        <TimeLineSliderGridProjects container item xs={12}>
          <Slider
            track={false}
            max={100 - 100 / dateArray.length}
            step={100 / dateArray.length}
            aria-labelledby="track-false-range-slider"
            getAriaValueText={valuetext}
            value={dotValues}
            marks={marks}
            sx={sliderSx}
          />
        </TimeLineSliderGridProjects>
      )}
    </>
  );
};

export default TimeLineSlider;
