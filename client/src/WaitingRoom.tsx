import React from 'react';

import './assets/css/App.css';

type Props = {
  user: any;
};

class WaitingRoom extends React.Component<Props> {
  static defaultProps = { user: null }

  render() {
    return (
      <div className="centered-container">
        {this.props.user && (
          <div>
            <p>We’re setting you up on a date.<br />This usually takes a couple of minutes.</p>
          </div>
        )}
      </div>
    );
  }
}

export default WaitingRoom;
