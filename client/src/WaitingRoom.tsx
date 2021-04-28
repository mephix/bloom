import React from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import VideocamIcon from '@material-ui/icons/Videocam';
import FavoriteIcon from '@material-ui/icons/Favorite';

import { db, time } from './config/firebase';
import * as  service from './services/service';

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
    let now = time.now();

    db.collection('Dates')
      .where('for', '==', this.props.user.email)
      .where('active', '==', true)
      .where('end', '>', now)
      .onSnapshot((querySnapshot) => {
        this.setCards(querySnapshot.docs);
      });
    
    db.collection('Dates')
      .where('with', '==', this.props.user.email)
      .where('active', '==', true)
      .where('end', '>', now)
      .onSnapshot((querySnapshot) => {
        this.setCards(querySnapshot.docs);
      });

    db.collection('Prospects')
      .doc(this.props.user.email)
      .onSnapshot((doc) => {
        this.setCards([doc]);
      });
  }

  setCards(new_cards: any[]): void {
    let cards = new_cards;
    this.setState({cards}, () => this.constructActiveCard());
  }

  constructActiveCard() {
    // TODO: Move this into a cloud function because it's more backendy.
    // This really belongs on the "backend".
    let current_card_ref = this.state.cards[0];
    if (!current_card_ref) return;

    let current_card_data = current_card_ref.data();
    let active_card: any = {};

    if (current_card_data.prospects && current_card_data.prospects.length > 0) {
      db.doc(`/Users/${current_card_data.prospects[0].id}`)
        .onSnapshot((doc) => {
          active_card.user = doc.data();
          this.setState({ active_card });
      });;
    } else if (current_card_data.with !== this.props.user.email) {
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
    if (!this.state.active_card || !this.state.active_card.user) return;

    if (this.state.active_card.date_id) {
      return (
        <Card className="prospect-card" variant="outlined">
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2" className="card-title">
              {this.state.active_card.user.firstName}
            </Typography>
            <Typography className="card-details" component="p">
              {this.state.active_card.user.bio}
            </Typography>
          </CardContent>
          <CardActions className="card-actions">
            <IconButton 
              onClick={() => service.nextDate(
                this.props.user.email, 
                this.state.active_card.user.email, 
                this.state.active_card.date_id)}
              color="primary">
              <CloseIcon />
            </IconButton>
            <IconButton 
              onClick={() => service.joinDate(
                this.props.user.email, 
                this.state.active_card.user.email, 
                this.state.active_card.date_id)} 
              color="primary">
              <VideocamIcon />
            </IconButton>
          </CardActions>
        </Card>
      );
    }

    return (
      <Card className="prospect-card" variant="outlined">
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2" className="card-title">
            {this.state.active_card.user.firstName}
          </Typography>
          <Typography className="card-details" component="p">
            {this.state.active_card.user.bio}
          </Typography>
        </CardContent>
        <CardActions className="card-actions">
          <IconButton 
            onClick={() => service.nextProspect(
              this.props.user.email, 
              this.state.active_card.user.email)}
            color="primary">
            <CloseIcon />
          </IconButton>
          {this.state.active_card.user.here ? (
            <Button
              onClick={() => service.inviteProspect(
                this.props.user.email, 
                this.state.active_card.user.email)} 
              variant="contained" 
              color="primary"
              className="primary-button">
              Invite
            </Button>
          ) : (
            <IconButton 
              onClick={() => service.heartProspect(
                this.props.user.email, 
                this.state.active_card.user.email)} 
              color="primary">
              <FavoriteIcon />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  }

  render() {
    return (
      <div className="centered-container">
        {(this.props.user && this.state.cards.length <= 0) && (
          <div>
            <p>We’re setting you up on a date.<br />This usually takes a couple of minutes.</p>
          </div>
        )}
        {(this.props.user && this.state.cards.length > 0) && (
          <div className="card-container">
            {this.renderCard()}
          </div>
        )}
      </div>
    );
  }
}

export default WaitingRoom;
