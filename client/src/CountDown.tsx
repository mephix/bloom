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
      <div>
        {this.state.timeRemaining}
        <p>You have a date with:</p>
      </div>
    );
  }
}

export default CountDown;
