import React from 'react';

import { db } from './config/firebase';

import './assets/css/App.css';

type Props = {
  user: any;
};

type State = {
  cards: any[];
  active_card: any
};

class WaitingRoom extends React.Component<Props, State> {
  static defaultProps = { user: null }

  constructor(props: Props) {
    super(props);

    this.state = {
      cards: [],
      active_card: null
    }
  }

  componentDidMount() {    
    // Construct cards of different types and push to cards state
    // Firebase doesn't currently support OR queries so this is quite
    // repetative.

    // TODO: Move this into a cloud function because it's more backendy.
    // This really belongs on the "backend"
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
    this.setState({cards}, () => this.constructActiveCard());
  }

  constructActiveCard() {
    // TODO: Move this into a cloud function because it's more backendy.
    // This really belongs on the "backend".
    let current_card_ref = this.state.cards[0];
    let current_card_data = current_card_ref.data();
    let active_card: any = {};

    if (current_card_data.prospects) {
      db.collection('Users').doc(current_card_data.prospects[0])
        .onSnapshot((doc) => {
          active_card.user = doc.data();
          this.setState({ active_card });
      });;
    } else if (current_card_data.with) {
      db.collection('Users')
        .doc(current_card_data.with)
        .onSnapshot((doc) => {
          active_card.user = doc.data();
          active_card.date_id = current_card_ref.id;
          this.setState({ active_card });
        });
    } else if (current_card_data.for !== this.props.user.email) {
      db.collection('Users')
        .doc(current_card_data.for)
        .onSnapshot((doc) => {
          active_card.user = doc.data();
          active_card.date_id = current_card_ref.id;
          this.setState({ active_card });
        });
    }
  }

  renderCard(): any {
    console.log(this.state.active_card)
    return <div>Test</div>;
  }

  render() {
    return (
      <div className="centered-container">
        {(this.props.user && this.state.cards.length <= 0) && (
          <div>
            <p>We’re setting you up on a date.<br />This usually takes a couple of minutes.</p>
          </div>
        )}
        {(this.props.user && this.state.cards.length > 0 && this.state.active_card) && (
          <div>
            {this.renderCard()}
          </div>
        )}
      </div>
    );
  }
}

export default WaitingRoom;
