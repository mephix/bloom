import { useEffect } from 'react'
import { Logger } from 'utils'

const logger = new Logger('RenderLog', '#8c03fc')

export const useRenderLog = (name: string) => {
  useEffect(() => {
    logger.log(`${name} mounted`)
    return () => {
      logger.log(`${name} unmounted`)
    }
  }, [name])
  useEffect(() => {
    logger.log(`${name} rendered`)
  })
}
