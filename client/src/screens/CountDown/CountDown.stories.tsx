import { FC } from 'react'
import { Story, Meta } from '@storybook/react'
import { CountDown } from './CountDown'
import { CountDownProps } from './CountDown.type'
// import { WaitingRoomProps } from './WaitingRoom.type'
// import { CardProps } from './Card.type'

export default {
  title: 'Screens/CountDown',
  component: CountDown
} as Meta

const Wrapper: FC = ({ children }) => (
  <div style={{ width: '300px', height: '545px', backgroundColor: 'black' }}>
    {children}
  </div>
)

const Template: Story<CountDownProps> = args => (
  <Wrapper>
    <CountDown {...args} />
  </Wrapper>
)

export const CountDownEmpty = Template.bind({})
CountDownEmpty.args = {
  user: {
    name: 'First Name',
    bio: 'this is a bio \n can have multiple lines'
  }
}

export const CountDownUser = Template.bind({})
CountDownUser.args = {
  user: {
    name: 'Paul',
    bio: 'Coffee maven. Troublemaker. Total bacon guru. Web fanatic.'
  }
}
