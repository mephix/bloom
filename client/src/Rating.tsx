import React from 'react';

import './assets/css/App.css';

type Props = {
  rateDate: Function;
  restart: Function;
};

type State = {
  rated: boolean;
};

class Rating extends React.Component<Props, State> {
  static defaultProps = { rateDate: null, restart: null }

  constructor(props: Props) {
    super(props);
    this.state = {rated: false};
  }

  render() {
    return (
      <React.Fragment>
        {this.state.rated ? (
          <div>
            <p>Do you want to go on another date?</p>
            <button>No</button>
            <button onClick={() => this.props.restart()}>Yes</button>
          </div>
        ) : (
          <div>
            <p>Time’s Up!</p>
            <p>Rate:</p>
            <button onClick={() => this.props.rateDate('fun')}>Fun</button>
            <button onClick={() => this.props.rateDate('heart')}>Heart</button>
            <button onClick={() => this.setState({rated: true})}>Done</button>
          </div>
        )}
        
      </React.Fragment>
    );
  }
}

export default Rating;
