import { Story, Meta } from '@storybook/react'
import { FC } from 'react'
import { Card } from './Card'
import { CardProps } from './Card.type'

export default {
  title: 'Components/Card',
  component: Card
} as Meta

const Wrapper: FC = ({ children }) => (
  <div
    style={{
      width: '300px',
      height: '545px',
      backgroundColor: 'black',
      paddingTop: '30px',
      boxSizing: 'border-box'
    }}
  >
    {children}
  </div>
)

const Template: Story<CardProps> = args => (
  <Wrapper>
    <Card {...args} />
  </Wrapper>
)

export const CardJoin = Template.bind({})
CardJoin.args = {
  user: {
    avatar: '/docs/placeholder.jpg',
    name: 'Name',
    bio: 'this is a bio \n can have multiple lines'
  }
}

export const CardInvite = Template.bind({})
CardInvite.args = {
  user: {
    avatar: '/docs/paul.jpg',
    name: 'Paul',
    bio: 'Coffee maven. Troublemaker. Total bacon guru. Web fanatic.'
  },
  type: 'invite'
}

export const CardLike = Template.bind({})
CardLike.args = {
  user: {
    avatar: '/docs/jane.jpg',
    name: 'Jane',
    bio: 'Friendly coffeeaholic. \n Tv maven. Social media fan. Music guru.'
  },
  type: 'like',
  background:
    'linear-gradient(309deg, rgba(149,20,187,1) 29%, rgba(221,89,255,1) 100%)'
}
