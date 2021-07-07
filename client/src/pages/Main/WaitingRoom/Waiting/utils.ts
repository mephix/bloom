import { useMemo } from 'react'
import { useAppSelector } from 'store'
import { selectCards } from 'store/meetup'

export const useTopCard = () => {
  const cards = useAppSelector(selectCards)
  const card = useMemo(() => (cards.length > 0 ? cards[0] : null), [cards])

  return card
}
