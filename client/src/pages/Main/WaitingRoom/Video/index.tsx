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
import { selectBlindDate, selectCurrentDate } from 'store/meetup'
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
import { BlindScreen } from './BlindScreen'

const logger = new Logger('Video', 'red')

const fadeInAnimation = {
  animation: 'linear 10s inAnimation'
}

const COUNT_DOWN = 10

export const Video = () => {
  const dispatch = useAppDispatch()
  const currentDate = useAppSelector(selectCurrentDate)
  const blindDate = useAppSelector(selectBlindDate)
  // const defaultEndDateTime = Date.now() + 10 * 60 * 60 * 1000
  const videoFrameRef = useRef<HTMLIFrameElement>(null)
  const [dailyObj, setDailyObj] = useState<DailyCall | null>(null)
  const [timeoutObject] = useState<{
    black: null | NodeJS.Timeout
    blind: null | NodeJS.Timeout
  }>({
    black: null,
    blind: null
  })
  const [visibleCountDown, setVisibleCountDown] = useState(true)
  const [visibleBlindScreen, setVisibleBlindScreen] = useState(true)
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
      if (timeoutObject.black) clearTimeout(timeoutObject.black)
      if (timeoutObject.blind) clearTimeout(timeoutObject.blind)

      return dispatch(setAppState('WAITING'))
    }
    if (!currentDate?.dateId) {
      if (timeoutObject.black) clearTimeout(timeoutObject.black)
      if (timeoutObject.blind) clearTimeout(timeoutObject.blind)

      dispatch(setAppState('WAITING'))
      return UserService.setFree(true)
    }
    const available = await MeetupService.checkAvailabilityAfterCountdown(
      currentDate.dateId
    )
    if (!available) {
      if (timeoutObject.black) clearTimeout(timeoutObject.black)
      if (timeoutObject.blind) clearTimeout(timeoutObject.blind)
      return
    }
    setVisibleCountDown(false)
    dailyObj.setLocalAudio(true)
    dailyObj.setLocalVideo(true)

    MeetupService.setCurrentDateTimeField('timeJoin')
  }, [dailyObj, dispatch, currentDate, timeoutObject])

  const setupBlindDate = useCallback(() => {
    const dateStartTime = currentDate?.start!
    const dateEndTime = currentDate?.end!
    const timeTilDateSecondHalf = calcTimeTilDateSecondHalf(
      dateStartTime,
      dateEndTime
    )
    console.log('time till second half', timeTilDateSecondHalf)
    timeoutObject.blind = setTimeout(() => {
      console.log('blinc ended!')
      setVisibleBlindScreen(false)
    }, timeTilDateSecondHalf)
  }, [currentDate, timeoutObject])

  const startDate = useCallback(async () => {
    const dateEndTime = currentDate?.end!
    if (blindDate) setupBlindDate()
    else setVisibleBlindScreen(false)
    const tenSecondsBeforeEnd = dayjs(dateEndTime * 1000)
      .subtract(10, 'seconds')
      .diff(dayjs())

    timeoutObject.black = setTimeout(() => {
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
      daily.setLocalVideo(false)
      // daily.startRecording()
    })
    daily.on('left-meeting', () => {
      if (timeoutObject.black) clearTimeout(timeoutObject.black)
      if (timeoutObject.blind) clearTimeout(timeoutObject.blind)
      // daily.stopRecording()
      dispatch(setAppState('RATING'))
      MeetupService.setCurrentDateTimeField('timeLeft')
    })

    daily.join({ url: roomUrl })
    setDailyObj(daily)
  }, [
    videoFrameRef,
    currentDate,
    dispatch,
    timeoutObject,
    setupBlindDate,
    blindDate
  ])

  useEffect(() => {
    hideTabs()
    startDate()
  }, [startDate, hideTabs])
  console.log('current date', currentDate)

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
      ></VideoFrame>
      {visibleBlindScreen && <BlindScreen />}
      <LeaveVideoButton onClick={endDate}>Leave date</LeaveVideoButton>
    </FullScreen>
  )
}

function calcTimeTilDateSecondHalf(dateStart: number, dateEnd: number): number {
  const start = dayjs(dateStart * 1000)
  const end = dayjs(dateEnd * 1000)
  console.log(start.format(), end.format())
  const startEndDiff = end.diff(start)
  const dateHalf = start.add(startEndDiff / 2, 'milliseconds')
  console.log(dateHalf.format())
  const timeTilHalf = dateHalf.diff(dayjs())
  console.log(timeTilHalf)
  return timeTilHalf > 0 ? timeTilHalf : 0
}
