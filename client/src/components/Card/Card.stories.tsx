import { Story, Meta } from '@storybook/react'
import { Card } from './Card'
import { CardProps } from './Card.type'

export default {
  title: 'Docs/Card',
  component: Card,
  argTypes: {
    background: { control: 'color' }
  }
} as Meta

const Template: Story<CardProps> = args => <Card {...args} />

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
