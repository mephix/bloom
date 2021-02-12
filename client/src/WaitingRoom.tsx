import React from 'react';

import './assets/css/App.css';

type Props = {};

type State = {};

class WaitingRoom extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <p>We’re setting you up on a date.</p>
        <p>This usually takes a couple of minutes.</p>
        <p>In the meantime, feel free to invite people.</p>
      </div>
    );
  }
}

export default WaitingRoom;
