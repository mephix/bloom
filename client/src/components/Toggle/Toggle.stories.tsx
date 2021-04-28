import { Story, Meta } from '@storybook/react'
import { Toggle } from './Toggle'
import { ToggleProps } from './Toggle.type'

export default {
  title: 'Docs/Toggle',
  component: Toggle
} as Meta

const Template: Story<ToggleProps> = args => <Toggle {...args} />

export const Toggled = Template.bind({})
Toggled.args = {
  toggled: true,
  toggleMessages: {
    on: "I'm free",
    off: "I'm not free"
  }
}

export const Untoggled = Template.bind({})
Untoggled.args = {
  toggled: false,
  toggleMessages: {
    on: 'On state',
    off: 'Off state'
  }
}
