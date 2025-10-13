'use client';

import { Button, Container, Text, Title } from '@mantine/core';
import classes from './hero-with-image.module.css';
import { useNavigator } from '@hooks/use-navigator';

export function HeroWithImage() {
  const navigator = useNavigator();

  const onGetStartedClick = () => {
    navigator.moveTo.main.home();
  };

  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              간단하고 쉽게 <br />
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: 'pink', to: 'yellow' }}
              >
                Full Stack 웹 서비스를 개발하는
              </Text>{' '}
              <br />
              MyApp Template
            </Title>

            <Text className={classes.description} mt={30}>
              나만의 웹서비스를 쉽고 빠르게 만들고 배포하세요! <br />
              Next.js와 Mantine, 그리고 PrismaORM이 세팅되어 있습니다. <br />
              퀄리티 있는 웹 서비스를 빠르게 개발할 수 있습니다. <br />
              지금 바로 MyApp으로 나만의 웹서비스를 만들어 보세요!
            </Text>

            <Button
              variant="gradient"
              gradient={{ from: 'pink', to: 'yellow' }}
              size="xl"
              className={classes.control}
              mt={40}
              onClick={onGetStartedClick}
            >
              시작하기
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
