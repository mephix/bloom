import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { db, time } from './config/firebase';

import CountDown from './CountDown';
import Rating from './Rating';
import WaitingRoom from './WaitingRoom';
import Video from './Video';

import './assets/css/App.css';
import logo from './assets/images/bloom.jpeg';

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
  active_video_session: boolean;
  video_session_time_remaining: {
    minutes: number;
    seconds: number;
  };
};

const APP_STATE: AppState = {
  waiting: 'waiting',
  countdown: 'countdown',
  video: 'video',
  rating: 'rating'
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
      active_video_session: false,
      video_session_time_remaining: {
        minutes: 999,
        seconds: 999
      }
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
      db.collection('Users')
        .doc(email)
        .onSnapshot((doc) => {
          this.setState({ user: doc.data() }, () => {
            this.updateUser(this.state.user.email, {
              here: true,
              free: true,
            });
            this.findDate(this.state.user.email);
          });
        });
    }

    // If user closes browser tab
    window.addEventListener('beforeunload', (event: Event) => {
      event.preventDefault();
      this.updateUser(this.state.user.email, { here: false });

      if (this.state.active_video_session) {
        this.endVideo();
      }
    });

    // On back/forward buttons
    window.onhashchange = () => {
      if (this.state.active_video_session) {
        this.updateUser(this.state.user.email, { here: false });
        this.endVideo();
      }
    };
  }

  componentDidUpdate() {
    // This is where we listen for updates.
    // Handle the app state changes here when user state changes.

    if (this.shouldStartCountdown()) {
      this.setState({ app_state: APP_STATE.countdown });
      this.updateUser(this.state.user.email, { free: false });
    }
  }

  //
  //
  // Services
  //
  //

  findDate(email: string): void {
    db.collection('Dates')
      .where('for', '==', email)
      .where('end', '>', time.now())
      .where('active', '==', true)
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.docs.length === 1) {
          this.setState({ available_date: querySnapshot.docs[0] }, () =>
            this.getMatchingUser(this.state.available_date.data().with)
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

  async updateUser(email: string, params: any): Promise<void> {
    await db.collection('Users').doc(email).update(params);
  }

  async updateDateObject(id: string, params: any): Promise<void> {
    await db.collection('Dates').doc(id).update(params);
  }

  //
  //
  // Checks
  //
  //

  shouldStartCountdown(): boolean {
    return (
      this.usersAreAvailable() &&
      this.state.app_state !== APP_STATE.countdown &&
      this.state.app_state !== APP_STATE.rating &&
      !this.state.active_video_session
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

  //
  //
  // State functions
  //
  //

  startVideo(): void {
    this.updateDateObject(this.state.available_date.id, { joined: true });
    this.setState({
      app_state: APP_STATE.video,
      active_video_session: true
    });

    // Start timer
    let timerState = setInterval(() => {
      if (
        this.state.video_session_time_remaining.minutes <= 0 &&
        this.state.video_session_time_remaining.seconds <= 1
      ) {
        clearInterval(timerState);
        this.endVideo();
      }

      let total_seconds_remaining =
        this.state.available_date.data().end.seconds - time.now().seconds;
      let minutes = Math.floor(total_seconds_remaining / 60);
      let seconds = total_seconds_remaining - minutes * 60;

      this.setState({
        video_session_time_remaining: {
          minutes,
          seconds
        }
      });
    }, 1000);
  }

  endVideo(): void {
    this.updateDateObject(this.state.available_date.id, {
      left: true,
      active: false
    });
    this.updateUser(this.state.user.email, { free: true });
    this.setState({
      app_state: APP_STATE.rating,
      active_video_session: false,
      video_session_time_remaining: {
        minutes: 999,
        seconds: 999
      }
    });

    // Clear timer
  }

  rateDate(ratingType: string): void {
    this.updateDateObject(this.state.available_date.id, { [ratingType]: true });
  }

  restart(): void {
    this.updateUser(this.state.user.email, { free: true }).then(() => {
      this.setState({
        app_state: APP_STATE.waiting,
        active_video_session: false
      });
    });
  }

  renderView(): any {
    const VIEW_STATE: any = {
      waiting: <WaitingRoom user={this.state.user} />,
      countdown: (
        <CountDown
          user={this.state.user}
          matching_user={this.state.matching_user}
          startVideo={() => this.startVideo()}
        />
      ),
      video: (
        <Video
          user={this.state.user}
          matching_user={this.state.matching_user}
          available_date={this.state.available_date}
          endVideo={() => this.endVideo()}
        />
      ),
      rating: (
        <Rating
          available_date={this.state.available_date}
          matching_user={this.state.matching_user}
          rateDate={this.rateDate.bind(this)}
          restart={() => this.restart()}
        />
      )
    };

    return VIEW_STATE[this.state.app_state];
  }

  render() {
    return (
      <div className="app">
        <AppBar position="static" className="app-bar">
          <Toolbar>
            {this.state.app_state === APP_STATE.video ? (
              <React.Fragment>
                <div>{this.state.matching_user.firstName}</div>
                <div
                  className={
                    this.state.video_session_time_remaining.minutes < 1
                      ? 'video-timer ending'
                      : 'video-timer'
                  }
                >
                  <div className="video-timer-panel">
                    {this.state.video_session_time_remaining.minutes}
                  </div>
                  <div className="video-timer-panel">
                    {this.state.video_session_time_remaining.seconds}
                  </div>
                </div>
              </React.Fragment>
            ) : (
              <img src={logo} className="logo" alt="Bloom" />
            )}
          </Toolbar>
        </AppBar>
        <div className="app-content">{this.renderView()}</div>
      </div>
    );
  }
}
