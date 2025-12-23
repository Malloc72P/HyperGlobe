import type { StoryObj } from '@storybook/react-vite';
import { ColorScaleStoryComponent } from './use-colorscale.demo';
import { DUMMY_CODE } from './use-colorscale.demo.dummy';

const DUMMY = true;

const meta = {
  title: 'Hooks/useColorScale',
  component: ColorScaleStoryComponent,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'ColorScale',
  args: {},
  parameters: { docs: { source: { code: DUMMY_CODE } } },
};
