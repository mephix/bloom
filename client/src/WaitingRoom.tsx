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
      this.setCards(querySnapshot.docs);
    });
  
  db.collection('Dates')
    .where('with', '==', this.props.user.email)
    .where('active', '==', true)
    .onSnapshot((querySnapshot) => {
      this.setCards(querySnapshot.docs);
    });

  db.collection('Prospects')
    .doc(this.props.user.email)
    .onSnapshot((doc) => {
      this.setCards(doc.get('prospects'));
    });
  }

  setCards(new_cards: any[]): void {
    let cards = [this.state.cards, new_cards].flat();
    this.setState({cards}, () => console.log(this.state.cards))
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
