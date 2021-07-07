import { IonContent, IonPage } from '@ionic/react'
import { Header } from 'components/Header'
import { FC } from 'react'

interface ScreenProps {
  color?: string
  header?: boolean
  fixed?: boolean
}

export const Screen: FC<ScreenProps> = ({ children, color, header, fixed }) => {
  return (
    <IonPage>
      {header && <Header />}
      <IonContent scrollY={!fixed} color={color}>
        {children}
      </IonContent>
    </IonPage>
  )
}
