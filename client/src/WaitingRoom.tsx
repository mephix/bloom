import React from 'react';

import { db } from './config/firebase';

import './assets/css/App.css';

type Props = {
  user: any;
};

type State = {
  cards: any[];
};

class WaitingRoom extends React.Component<Props, State> {
  static defaultProps = { user: null }

  constructor(props: Props) {
    super(props);

    this.state = {
      cards: []
    }
  }

  componentDidMount() {
    // Construct cards of different types and push to cards state
      db.collection('Dates')
      .where('for', '==', this.props.user.email)
      .where('active', '==', true)
      .onSnapshot((querySnapshot) => {
        let cards = this.state.cards;
        cards.push(querySnapshot.docs);

        this.setState({cards}, () => console.log(this.state.cards));
      });
    
    db.collection('Dates')
      .where('with', '==', this.props.user.email)
      .where('active', '==', true)
      .onSnapshot((querySnapshot) => {
        let cards = this.state.cards;
        cards.push(querySnapshot.docs);

        this.setState({cards}, () => console.log(this.state.cards));
      });    
  }

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
