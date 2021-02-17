import React from 'react';
import DailyIframe from '@daily-co/daily-js';

import './assets/css/App.css';

type Props = {
  user: any;
  matching_user: any;
  available_date: any;
  endVideo: Function;
};

type State = {
  iframeRef: any;
};

class VideoCallFrame extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      iframeRef: null,
    };
  }

  componentDidMount() {
    if (!this.props.available_date) {
      console.error('No date was available for video chat.');
      return;
    }

    this.props.available_date.data().room.get().then((room: any) => {
      let roomUrl = room.data().url;

      this.setState({ iframeRef: React.createRef() }, () => {
        let daily;
        daily = DailyIframe.wrap(this.state.iframeRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          showParticipantsBar: false
        });
        daily.on('left-meeting', () => this.props.endVideo());
        daily.join({ url: roomUrl });
      });
    })
  }

  render() {
    return (
      <iframe
        className="video-frame"
        title="date-video"
        ref={this.state.iframeRef}
        allow="camera; microphone; fullscreen"
        height="100%"
        width="100%"
      ></iframe>
    );
  }
}

export default VideoCallFrame;
