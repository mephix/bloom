import React from 'react';
import DailyIframe from '@daily-co/daily-js';

import './assets/css/App.css';

type Props = {
  user: any;
  matching_user: any;
  available_date: any;
  url: string;
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
    if (!this.props.url) {
      console.error('No URL was set for video chat');
      return;
    }

    this.setState({ iframeRef: React.createRef() }, () => {
      let daily;
      daily = DailyIframe.wrap(this.state.iframeRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        showParticipantsBar: false
      });
      daily.join({ url: this.props.url });
    });
    
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
