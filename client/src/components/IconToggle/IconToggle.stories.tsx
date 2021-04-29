import { Story, Meta } from '@storybook/react'
import { IconToggle } from './IconToggle'
import { IconToggleProps } from './IconToggle.type'

export default {
  title: 'Components/IconToggle',
  component: IconToggle
} as Meta

const Template: Story<IconToggleProps> = args => <IconToggle {...args} />

export const Heart = Template.bind({})
Heart.args = {
  toggled: true,
  type: 'heart'
}

export const Dislike = Template.bind({})
Dislike.args = {
  toggled: false,
  type: 'dislike'
}
