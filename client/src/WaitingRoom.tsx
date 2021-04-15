import React from 'react';
import Toggle from "./Toggle"
import './assets/css/App.css';

type Props = {
  user: any;
  updateUser: Function;
};

class WaitingRoom extends React.Component<Props> {
  static defaultProps = { user: null }
  render() {
    return (
      <div className="centered-container">
        {this.props.user && (
          <React.Fragment>
            <Toggle user={this.props.user} updateUser={this.props.updateUser}/>
            <div>
              <p>We’re setting you up on a date.<br />This usually takes a couple of minutes.</p>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default WaitingRoom;
