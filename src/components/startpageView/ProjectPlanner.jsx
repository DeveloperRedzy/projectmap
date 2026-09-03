import React from 'react';
import { Grid, Typography, styled } from '@mui/material';
import ProjectPlannerCards from './ProjectPlannerCards';
import MyProjectIllustration from '../../assets/MyProjectIllustration.svg';
import ManagerViewIllustration from '../../assets/ManagerViewIllustration.svg';
import CreateNewProjectIllustration from '../../assets/CreateNewProjectIllustration.svg';

const ContainerGrid = styled(Grid)`
  min-height: 592px;
  padding-top: 48px;
  padding-bottom: 52px;
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const MainTitle = styled(Typography)`
  font-size: 34px;
  font-weight: 400;
  line-height: 42px;
  letter-spacing: 0.25px;
  color: #000000;
  opacity: 0.87;
`;

const MainDescription = styled(Typography)`
  font-size: 14px;
  font-weight: 400;
  width: 328px;
  height: 40px;
  line-height: 20px;
  letter-spacing: 0.15px;
  color: #000000;
  opacity: 0.6;
  padding-bottom: 32px;
`;

const data = [
  {
    id: 1,
    title: 'NEW PROJECT MAPPING',
    description: 'Begin your new project here.',
    buttonText: 'Map Project',
    image: CreateNewProjectIllustration,
    linkTo: '/projectmap/overview',
  },
  {
    id: 2,
    title: 'INDEX OF ALL PROJECTS',
    description:
      'Find the list of all projects including details for each and every one of them.',
    buttonText: 'View Project',
    image: MyProjectIllustration,
    linkTo: '/projectmap/overview',
  },
  {
    id: 3,
    title: "MANAGER'S VIEW",
    description:
      'Displays an aggregation of all deliverables in order to identify possible issues and take action to solve them.',
    buttonText: 'Track Project',
    image: ManagerViewIllustration,
    linkTo: '/projectmap/managerview',
  },
];

const ProjectPlanner = () => {
  return (
    <>
      <Grid
        container
        sx={{
          backgroundColor: '#F8F8F8',
          px: { xs: '20px', md: '52px' },
        }}
      >
        <ContainerGrid
          container
          item
          xl={12}
          lg={12}
          md={12}
          xs={12}
          spacing={2}
        >
          <Grid container item md={12} xs={12}>
            <MainTitle id="title2">Map, View, Track & Go!</MainTitle>
          </Grid>
          <Grid container item md={12} xs={12}>
            <MainDescription>
              Break down your first project in an instant, from the overall
              scheme to the specific tasks.
            </MainDescription>
            <Grid container item xs={12} md={12}>
              {data.map((projectData) => (
                <Grid
                  item
                  xl={4}
                  lg={4}
                  md={4}
                  sm={12}
                  xs={12}
                  key={projectData.id}
                  sx={{ pt: '30px' }}
                >
                  <ProjectPlannerCards
                    key={projectData.id}
                    projectData={projectData}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </ContainerGrid>
      </Grid>
    </>
  );
};

export default ProjectPlanner;
