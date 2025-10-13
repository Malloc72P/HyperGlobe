import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconComponents,
  IconDatabaseHeart,
  IconDeviceMobile,
  IconDownload,
  IconMapPin,
} from '@tabler/icons-react';
import classes from './feature.module.css';

export const MOCKDATA = [
  {
    icon: IconMapPin,
    title: 'Next.js Server Action',
    description:
      'Next.js의 Server Action을 통해 백엔드 로직을 작성할 수 있습니다. 예외처리를 위한 타입 체계가 준비되어 있으니, 안정적인 서버 사이드 로직을 구현하세요.',
  },
  {
    icon: IconComponents,
    title: 'Mantine UI Ready',
    description:
      '다양한 컴포넌트를 제공하는 Mantine UI가 통합되어 있습니다. 빠르고 쉽게 UI를 구성할 수 있으며, 반응형 디자인을 지원합니다. 사용자 경험을 향상시키는 데 최적화된 컴포넌트를 활용하세요.',
  },
  {
    icon: IconDatabaseHeart,
    title: 'Prisma ORM',
    description:
      'Prisma ORM이 통합되어 데이터베이스와의 상호작용을 간편하게 만들어줍니다. 타입 안전한 쿼리 작성이 가능하며, 다양한 데이터베이스를 지원합니다. 데이터 모델링과 쿼리 작성이 쉬워집니다.',
  },
];

export function FeaturesCards() {
  const theme = useMantineTheme();

  const features = MOCKDATA.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={50} stroke={1.5} color={theme.colors.blue[6]} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" className={classes.wrapper}>
      <Group justify="center">
        <Badge variant="filled" size="lg">
          With MyApp Template
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        MyApp Template의 주요 기능
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Next.js와 Mantine, PrismaORM이 통합된 MyApp Template은 웹 개발을 간편하게 만들어줍니다.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}
