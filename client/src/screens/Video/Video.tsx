import DailyIframe, { DailyCall } from '@daily-co/daily-js'
// import { AppBar, Toolbar } from '@material-ui/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import moduleStyles from './Video.module.scss'
import app from '../../store/app'
import meetup from '../../store/meetup'

const minute = Date.now() + 60 * 60 * 1000

export const Video = () => {
  const videoFrameRef = useRef<HTMLIFrameElement>(null)
  const [dailyObj, setDailyObj] = useState<DailyCall | null>(null)
  const [endDateTime, setEndDateTime] = useState(minute)
  const [connecting, setConnecting] = useState(true)
  const endDate = useCallback(() => {
    if (!dailyObj) return app.setRaitingState()
    dailyObj.leave()
  }, [dailyObj])

  const startDate = useCallback(async () => {
    const room = await meetup.getRoom()
    if (!room) {
      console.error('No date was available for video chat.')
      app.setWaitingRoomState()
    }
    setEndDateTime(meetup.getEndTime() * 1000)
    const roomUrl = `${room?.url}?t=${room?.token}`
    if (!videoFrameRef.current) return
    const daily = DailyIframe.wrap(videoFrameRef.current, {
      showLeaveButton: false,
      showFullscreenButton: false,
      showParticipantsBar: false
    })
    daily.on('joined-meeting', () => {
      console.log('VIDEO', 'JOINED!')
      setConnecting(false)
    })
    daily.on('left-meeting', () => {
      app.setRaitingState()
      meetup.setLeftTime()
    })
    meetup.setJoinTime()
    daily.join({ url: roomUrl })
    setDailyObj(daily)
  }, [videoFrameRef])

  useEffect(() => {
    startDate()
  }, [startDate])
  return (
    <>
      {connecting && (
        <div className={moduleStyles.connecting}>
          <span>Connecting...</span>
        </div>
      )}
      <header className={moduleStyles.header}>
        <div className={moduleStyles.firstName}>
          {meetup.currentMatchingUserData?.firstName}
        </div>
        <Countdown
          date={endDateTime}
          onComplete={endDate}
          renderer={({ total, seconds }) => {
            const totalMin = total / 60 / 1000
            return (
              <div
                className={totalMin < 1 ? 'video-timer ending' : 'video-timer'}
              >
                <div className="video-timer-panel">{Math.floor(totalMin)}</div>
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
    </>
  )
}
