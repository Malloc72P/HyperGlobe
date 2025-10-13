'use client';

import { Logo } from '@components/logo';
import { useNavigator } from '@hooks/use-navigator';
import { PageLinkMap } from '@libs/link-map';
import { ActionIcon, Container, Group, Text } from '@mantine/core';
import classes from './landing-footer.module.css';
import { IconBrandGithub } from '@tabler/icons-react';

const data = [
  {
    title: 'About',
    links: [{ label: `Github Repository`, link: PageLinkMap.externalLink.repository() }],
  },
];

export function LandingFooter() {
  const navigator = useNavigator();

  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<'a'> key={index} className={classes.link} component="a" href={link.link}>
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo />
          <Text size="xs" c="dimmed" className={classes.description}>
            간단하고 쉽게 <br /> Full Stack 웹 서비스를 개발하는 <br /> MyApp Template
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © 2025 Malloc72P All rights reserved.
        </Text>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon
            size="lg"
            color="gray"
            variant="subtle"
            onClick={navigator.moveTo.externalLink.malloc72pGithub}
          >
            <IconBrandGithub size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
}
