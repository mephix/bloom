import React from 'react';

import './assets/css/App.css';

type Props = {
  rateDate: Function;
};

class Rating extends React.Component<Props> {
  static defaultProps = { rateDate: null }

  render() {
    return (
      <div>
        <p>Time’s Up!</p>
        <p>Rate:</p>
        <button onClick={() => this.props.rateDate('fun')}>Fun</button>
        <button onClick={() => this.props.rateDate('heart')}>Heart</button>
      </div>
    );
  }
}

export default Rating;
