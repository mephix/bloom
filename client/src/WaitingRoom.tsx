import React from 'react';

import './assets/css/App.css';

type Props = {
  user: any;
};

class WaitingRoom extends React.Component<Props> {
  static defaultProps = { user: null }

  render() {
    return (
      <div>
        {this.props.user && (
          <div>
            <p>We’re setting you up on a date.</p>
            <p>This usually takes a couple of minutes.</p>
            <p>In the meantime, feel free to invite people.</p>
          </div>
        )}
      </div>
    );
  }
}

export default WaitingRoom;
