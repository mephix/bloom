import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import Countdown from 'react-countdown'
import moduleStyles from './Video.module.scss'
import app from 'state/app'
import meetup from 'state/meetup'
import { fromSecondsToMillis } from 'services/dateClock.service'
import { CountDown } from './CountDown'
import user from 'state/user'
import { classes, Logger } from 'utils'
import { TabContext } from 'routes'
import commonStyles from '../Common.module.scss'

const logger = new Logger('Video', 'red')

const COUNT_DOWN = 10

const fadeInAnimation = {
  animation: 'linear 10s inAnimation'
}

export const Video = () => {
  const defaultEndDateTime = Date.now() + 10 * 60 * 60 * 1000
  const videoFrameRef = useRef<HTMLIFrameElement>(null)
  const [dailyObj, setDailyObj] = useState<DailyCall | null>(null)
  const [endDateTime, setEndDateTime] = useState(defaultEndDateTime)
  const [visibleCountDown, setVisibleCountDown] = useState(true)
  const [dateEnding, setDateEnding] = useState(false)
  const timeout = useMemo(() => Date.now() + COUNT_DOWN * 1000, [])
  // const [timeout] = useState(Date.now() + COUNT_DOWN * 1000)

  const { hideTabs } = useContext(TabContext)
  const endDate = useCallback(() => {
    if (!dailyObj) return app.setRaitingState()
    dailyObj.leave()
  }, [dailyObj])

  const countDownEnd = useCallback(async () => {
    logger.log('CountDown end')
    if (!dailyObj) {
      logger.error('No dailyObj!')
      return app.setWaitingRoomState()
    }
    const availability = meetup.checkAvailabilityAfterCountdown()
    if (!availability) return app.setWaitingRoomState()
    setVisibleCountDown(false)
    dailyObj.setLocalAudio(true)
    meetup.setJoinTime()
    user.setFree(false)
  }, [dailyObj])

  const startDate = useCallback(async () => {
    const room = await meetup.getRoom()
    if (!room) {
      logger.error('No date was available for video chat.')
      app.setWaitingRoomState()
    }
    const dateEndTime = fromSecondsToMillis(meetup.getEndTime())
    setEndDateTime(dateEndTime)
    setTimeout(() => {
      console.log('end date 10 sec')
    }, dateEndTime - 10 * 1000)
    const roomUrl = `${room?.url}?t=${room?.token}`
    if (!videoFrameRef.current) return
    const daily = DailyIframe.wrap(videoFrameRef.current, {
      showLeaveButton: false,
      showFullscreenButton: false,
      showParticipantsBar: false
    })
    daily.on('joined-meeting', () => {
      daily.setLocalAudio(false)
    })
    daily.on('left-meeting', () => {
      app.setRaitingState()
      meetup.setLeftTime()
    })

    daily.join({ url: roomUrl })
    setDailyObj(daily)
  }, [videoFrameRef, setDailyObj])

  useEffect(() => {
    hideTabs()
    startDate()
  }, [startDate, hideTabs])
  return (
    <div className={commonStyles.fullScreen}>
      {visibleCountDown && (
        <CountDown
          onComplete={countDownEnd}
          firstName={meetup.currentMatchingUserData?.firstName || ''}
          bio={meetup.currentMatchingUserData?.bio || ''}
          timeout={timeout}
        />
      )}
      {dateEnding && (
        <div
          className={classes(commonStyles.container, moduleStyles.fade)}
          style={fadeInAnimation}
        />
      )}
      <header className={moduleStyles.header}>
        <div className={moduleStyles.firstName}>
          {meetup.currentMatchingUserData?.firstName}
        </div>
        <Countdown
          date={endDateTime}
          onComplete={endDate}
          renderer={({ total, seconds }) => {
            const totalMin = Math.floor(total / 60 / 1000)
            console.log(totalMin, seconds)
            if (totalMin <= 0 && seconds <= 10 && !dateEnding) {
              setDateEnding(true)
            }
            return (
              <div
                className={totalMin < 1 ? 'video-timer ending' : 'video-timer'}
              >
                <div className="video-timer-panel">{totalMin}</div>
                <div className="video-timer-panel">{seconds}</div>
              </div>
            )
          }}
        />
      </header>
      <iframe
        className={moduleStyles.videoFrame}
        title="date-video"
        ref={videoFrameRef}
        allow="camera; microphone; fullscreen; autoplay; display-capture;"
        height="100%"
        width="100%"
      ></iframe>
      <button onClick={endDate} className={moduleStyles.leaveVideo}>
        Leave date
      </button>
    </div>
  )
}