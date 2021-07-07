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
import dayjs from 'dayjs'
import { TabContext } from 'routes/MainRoutes/TabContext'
import { MeetupService } from 'services/meetup.service'
import { UserService } from 'services/user.service'
import { useAppDispatch, useAppSelector } from 'store'
import { setAppState } from 'store/app'
import { selectCurrentDate } from 'store/meetup'
import { Logger } from 'utils'
import { FullScreen } from '../styled'
import { CountDown } from './CountDown'
import {
  FadeScreen,
  FirstNameSpan,
  LeaveVideoButton,
  VideoFrame,
  VideoHeader
} from './styled'

const logger = new Logger('Video', 'red')

const fadeInAnimation = {
  animation: 'linear 10s inAnimation'
}

const COUNT_DOWN = 10

export const Video = () => {
  const dispatch = useAppDispatch()
  const currentDate = useAppSelector(selectCurrentDate)
  // const defaultEndDateTime = Date.now() + 10 * 60 * 60 * 1000
  const videoFrameRef = useRef<HTMLIFrameElement>(null)
  const [dailyObj, setDailyObj] = useState<DailyCall | null>(null)
  const [timeoutObject] = useState<{ current: null | NodeJS.Timeout }>({
    current: null
  })
  const [visibleCountDown, setVisibleCountDown] = useState(true)
  const [dateEnding, setDateEnding] = useState(false)
  const timeout = useMemo(() => Date.now() + COUNT_DOWN * 1000, [])
  const { hideTabs } = useContext(TabContext)

  const endDate = useCallback(() => {
    if (!dailyObj) return dispatch(setAppState('RATING'))
    dailyObj.leave()
  }, [dailyObj, dispatch])

  const countDownEnd = useCallback(async () => {
    logger.log('CountDown End')
    if (!dailyObj) {
      logger.error('No dailyObj!')
      if (timeoutObject.current) clearTimeout(timeoutObject.current)
      return dispatch(setAppState('WAITING'))
    }
    if (!currentDate?.dateId) {
      if (timeoutObject.current) clearTimeout(timeoutObject.current)
      dispatch(setAppState('WAITING'))
      return UserService.setFree(true)
    }
    const available = await MeetupService.checkAvailabilityAfterCountdown(
      currentDate.dateId
    )
    if (!available) {
      if (timeoutObject.current) clearTimeout(timeoutObject.current)
      return
    }
    setVisibleCountDown(false)
    dailyObj.setLocalAudio(true)
    MeetupService.setCurrentDateTimeField('timeJoin')
  }, [dailyObj, dispatch, currentDate, timeoutObject])

  const startDate = useCallback(async () => {
    console.log('end', currentDate?.end!)
    const dateEndTime = currentDate?.end!
    const tenSecondsBeforeEnd = dayjs(dateEndTime * 1000)
      .subtract(10, 'seconds')
      .diff(dayjs())

    timeoutObject.current = setTimeout(() => {
      setDateEnding(true)
      console.log('end date 10 sec')
    }, tenSecondsBeforeEnd)
    const roomUrl = `${currentDate?.roomUrl}?t=${currentDate?.token}`
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
      if (timeoutObject.current) clearTimeout(timeoutObject.current)
      dispatch(setAppState('RATING'))
      MeetupService.setCurrentDateTimeField('timeLeft')
    })

    daily.join({ url: roomUrl })
    setDailyObj(daily)
  }, [videoFrameRef, currentDate, dispatch, timeoutObject])

  useEffect(() => {
    hideTabs()
    startDate()
  }, [startDate, hideTabs])

  return (
    <FullScreen>
      {visibleCountDown && (
        <CountDown
          onComplete={countDownEnd}
          firstName={currentDate?.firstName || ''}
          bio={currentDate?.bio || ''}
          timeout={timeout}
        />
      )}
      {dateEnding && <FadeScreen style={fadeInAnimation} />}
      <VideoHeader>
        <FirstNameSpan>{currentDate?.firstName}</FirstNameSpan>
        <Countdown
          date={currentDate?.end! * 1000}
          onComplete={endDate}
          renderer={({ total, seconds }) => {
            const totalMin = Math.floor(total / 60 / 1000)
            // console.log(totalMin, seconds)
            // if (totalMin <= 0 && seconds <= 10 && !dateEnding) {
            // }
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
      </VideoHeader>
      <VideoFrame
        title="date-video"
        ref={videoFrameRef}
        allow="camera; microphone; fullscreen; autoplay; display-capture;"
        height="100%"
        width="100%"
      ></VideoFrame>
      <LeaveVideoButton onClick={endDate}>Leave date</LeaveVideoButton>
    </FullScreen>
  )
}
