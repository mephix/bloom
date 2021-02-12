import React from 'react';

import './assets/css/App.css';

type Props = {};

type State = {};

class Rating extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <p>Time’s Up!</p>
      </div>
    );
  }
}

export default Rating;
