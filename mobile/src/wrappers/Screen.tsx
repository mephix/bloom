import { IonContent, IonPage } from '@ionic/react'
import { Header } from 'components/Header'
import { FC } from 'react'

interface ScreenProps {
  color?: string
  header?: boolean
}

export const Screen: FC<ScreenProps> = ({ children, color, header }) => {
  return (
    <IonPage>
      {header && <Header />}
      <IonContent color={color}>{children}</IonContent>
    </IonPage>
  )
}
