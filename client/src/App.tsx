import React from 'react';

import { db, time } from './config/firebase';

import './assets/css/App.css';

type AppState = {
  waiting: string;
  countdown: string;
  video: string;
  rating: string;
};

type Props = {};

type State = {
  user: any;
  matching_user: any;
  available_date: any;
  app_state: string;
};

const APP_STATE: AppState = {
  waiting: 'waiting',
  countdown: 'countdown',
  video: 'video',
  rating: 'rating',
};

const VIEW_STATE: any = {
  waiting: <div>Waiting room component</div>,
  countdown: <div>Countdown component</div>,
  video: <div>Video component</div>,
  rating: <div>Rating component</div>,
};

export default class App extends React.Component<Props, State> {
  // All application and state logic is controlled and stored here.
  //
  // Firebase objects:
  // User, Date
  //
  // App states:
  // Waiting room, Countdown, Video Chat, Rating
  //
  // When app loads:
  // 1. Get UID param from URL
  // 2. Find and subscribe to user in Firebase
  // 3. Get and subscribe to Date user is affiliated with
  // 4. Set user/date subscriptions in component state
  //
  // When user/date changes:
  // 1. Change app state appropriately
  //
  // When user clicks DONE on rating screen:
  // 1. Do some cleanup to User/Date objects
  // 2. Redirect user back to Adalo app

  constructor(props: Props) {
    super(props);
    this.state = {
      user: null,
      matching_user: null,
      available_date: null,
      app_state: APP_STATE.waiting,
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
      db.collection('Users')
        .doc(email)
        .onSnapshot((doc) => {
          this.setState({ user: doc.data() }, () =>
            this.findDate(this.state.user.email)
          );
        });
    }
  }

  componentDidUpdate() {
    // This is where we listen for updates.
    // Handle the app state changes here when user state changes.

    if (this.shouldBeCountingDown()) { 
      this.setState({ app_state: APP_STATE.countdown }) 
    } else if (this.shouldBeInVideo()) { 
      this.setState({ app_state: APP_STATE.video }) 
    } else if (this.shouldBeRating()) { 
      this.setState({ app_state: APP_STATE.rating }) 
    }
  }

  findDate(email: string): void {
    db.collection('Dates')
      .where('for', '==', email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.docs.length === 1) {
          this.setState({ available_date: querySnapshot.docs[0].data() }, () =>
            this.getMatchingUser(this.state.available_date.with)
          );
        }
      });
  }

  getMatchingUser(email: string): void {
    db.collection('Users')
      .doc(email)
      .onSnapshot((doc) => {
        this.setState({ matching_user: doc.data() });
      });
  }

  shouldBeWaiting(): boolean {
    return this.state.user;
  }

  shouldBeCountingDown(): boolean {
    return this.usersAreAvailable(); // && countingDown
  }

  shouldBeInVideo(): boolean {
    return this.usersAreAvailable(); // && !countingDown
  }

  shouldBeRating(): boolean {
    return (
      this.state.available_date &&
      this.state.available_date.left &&
      this.state.user &&
      this.state.user.finished
    );
  }

  usersAreAvailable(): boolean {
    return (
      this.state.user &&
      this.state.user.here &&
      this.state.user.free &&
      this.state.matching_user &&
      this.state.matching_user.here &&
      this.state.matching_user.free
    );
  }

  render() {
    return <div className="App">{VIEW_STATE[this.state.app_state]}</div>;
  }
}
