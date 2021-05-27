import { IonContent, IonPage } from '@ionic/react'
import { FC } from 'react'

export const Screen: FC = ({ children }) => {
  return (
    <IonPage>
      <IonContent color="dark">{children}</IonContent>
    </IonPage>
  )
}
