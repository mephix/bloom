import React, { FC } from 'react'
import { Story, Meta } from '@storybook/react'
import { WaitingRoom } from './WaitingRoom'
import { WaitingRoomProps } from './WaitingRoom.type'
// import { CardProps } from './Card.type'

export default {
  title: 'Screens/WaitingRoom',
  component: WaitingRoom
} as Meta

const Wrapper: FC = ({ children }) => (
  <div style={{ width: '300px', height: '545px', backgroundColor: 'black' }}>
    {children}
  </div>
)

const Template: Story<WaitingRoomProps> = args => (
  <Wrapper>
    <WaitingRoom {...args} />
  </Wrapper>
)

export const WainingRoomEmpty = Template.bind({})
WainingRoomEmpty.args = {
  user: {
    avatar: '/docs/placeholder.jpg',
    name: 'Name',
    bio: 'this is a bio \n can have multiple lines'
  }
}

export const WaitingRoomUser = Template.bind({})
WaitingRoomUser.args = {
  user: {
    avatar: '/docs/paul.jpg',
    name: 'Paul',
    bio: 'Coffee maven. Troublemaker. Total bacon guru. Web fanatic.'
  }
}
