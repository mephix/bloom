import React from 'react';

import './assets/css/App.css';

type Props = {
  user: any;
  matching_user: any;
  startVideo: Function;
};

type State = {
  timeRemaining: number;
};

class CountDown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      timeRemaining: 10,
    };
  }

  componentDidMount() {
    let timerState = setInterval(() => {
      if (this.state.timeRemaining <= 1) {
        clearInterval(timerState);

        this.props.startVideo();
      }

      this.setState({ timeRemaining: this.state.timeRemaining - 1 });
    }, 1000);
  }

  render() {
    return (
      <div className="centered-container">
        <div className="countdown-box">{this.state.timeRemaining}</div>
        <div className="countdown-details">
          <p>You have a date with:</p>
          <p><strong>{this.props.matching_user.firstName}</strong></p>
          <p>{this.props.matching_user.bio}</p>
        </div>
      </div>
    );
  }
}

export default CountDown;
