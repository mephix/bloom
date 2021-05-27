import { IonContent, IonPage } from '@ionic/react'
import { FC } from 'react'

interface ScreenProps {
  color?: string
}

export const Screen: FC<ScreenProps> = ({ children, color }) => {
  return (
    <IonPage>
      <IonContent color={color}>{children}</IonContent>
    </IonPage>
  )
}
