import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { AppBar, Toolbar } from '@material-ui/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import Countdown from 'react-countdown'
import moduleStyles from './Video.module.scss'
import app from '../../store/app'
import date from '../../store/date'

export const Video = () => {
  const videoFrameRef = useRef<HTMLIFrameElement>(null)
  const [dailyObj, setDailyObj] = useState<DailyCall | null>(null)
  const endDate = useCallback(() => {
    if (!dailyObj) return app.setRaitingState()
    date.setLeftTime()
    dailyObj.leave()
  }, [dailyObj])

  const startDate = useCallback(async () => {
    const room = await date.getRoom()
    if (!room) {
      console.error('No date was available for video chat.')
      app.setWaitingRoomState()
    }
    const roomUrl = `${room?.url}?t=${room?.token}`
    if (!videoFrameRef.current) return
    const daily = DailyIframe.wrap(videoFrameRef.current, {
      showLeaveButton: false,
      showFullscreenButton: false,
      showParticipantsBar: false,
    })
    daily.on('left-meeting', () => {
      app.setRaitingState()
    })
    date.setJoinTime()
    daily.join({ url: roomUrl })
    setDailyObj(daily)
  }, [videoFrameRef])

  useEffect(() => {
    startDate()
  }, [startDate])

  const fixedTime = Date.now() + 90 * 60 * 1000

  return (
    <>
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <div>{date.matchingUser?.firstName}</div>
          <Countdown
            date={fixedTime}
            onComplete={endDate}
            renderer={({ total, seconds }) => {
              const totalMin = total / 60 / 1000
              return (
                <div
                  className={
                    totalMin < 1 ? 'video-timer ending' : 'video-timer'
                  }
                >
                  <div className="video-timer-panel">
                    {Math.floor(totalMin)}
                  </div>
                  <div className="video-timer-panel">{seconds}</div>
                </div>
              )
            }}
          />
        </Toolbar>
      </AppBar>
      <iframe
        className={moduleStyles.videoFrame}
        title="date-video"
        ref={videoFrameRef}
        allow="camera; microphone; fullscreen"
        height="100%"
        width="100%"
      ></iframe>
      <button onClick={endDate} className={moduleStyles.leaveVideo}>
        Leave date
      </button>
    </>
  )
}
