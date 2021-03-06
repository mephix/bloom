import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

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
  redirecting: boolean;
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
      },
      redirecting: false
    };

    this.startVideo = this.startVideo.bind(this);
    this.endVideo = this.endVideo.bind(this);
    this.rateDate = this.rateDate.bind(this);
    this.redirectToApp = this.redirectToApp.bind(this);
    this.restart = this.restart.bind(this);
    this.browserTabActive = this.browserTabActive.bind(this);
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const now = time.now();

    if (email) {
      this.updateUser(email, {
        here: true,
        free: true,
        waitStartTime: now
      });

      db.collection('Users')
        .doc(email)
        .onSnapshot((doc) => {
          this.setState({ user: doc.data() }, () => {
            this.findDate(this.state.user.email);
          });
        });
    }

    // If user closes browser tab
    window.addEventListener('beforeunload', () => {
      // Beforeunload fires when we redirect the user. In this case,
      // we want to prevent the rest of this function from running.
      if (this.state.redirecting) return;

      this.updateUser(this.state.user.email, { here: false, free: true }).then(
        () => {
          this.endVideo();
        }
      );
    });

    // On back/forward buttons
    window.onhashchange = () => {
      if (this.state.active_video_session) {
        this.redirectToApp();
        this.endVideo();
      }
    };

    // When user navigates in/out of browser tab
    document.addEventListener('visibilitychange', this.browserTabActive, false);
  }

  componentDidUpdate() {
    // This is where we listen for updates.
    // Handle the app state changes here when user state changes.

    // If users get marked 'finished' by the backend
    if (
      this.state.user &&
      this.state.user.finished &&
      this.state.app_state === APP_STATE.waiting
    ) {
      this.redirectToApp();
    }

    // If for some reason users become unavailable during the countdown,
    // we want to send them back to the waiting room
    if (
      this.state.app_state === APP_STATE.countdown &&
      !this.usersAreAvailable()
    ) {
      this.restart();
    }

    // If all criteria is met to start a date, send user to countdown
    if (this.shouldStartCountdown()) {
      this.updateUser(this.state.user.email, { free: false }).then(() => {
        this.setState({ app_state: APP_STATE.countdown });
      });
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
      .onSnapshot((querySnapshot) => {
        // Firebase returns the latest Date object that was created as [0]
        // This could be improved, but it works with the current backend script logic.
        if (
          querySnapshot.docs[0] &&
          querySnapshot.docs[0].data().start.seconds < time.now().seconds
        ) {
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
      !this.state.active_video_session &&
      this.state.available_date &&
      this.state.available_date.data().active
    );
  }

  usersAreAvailable(): boolean {
    return (
      this.state.user &&
      this.state.user.here &&
      this.state.matching_user &&
      this.state.matching_user.here
    );
  }

  browserTabActive(): void {
    if (!this.state.user) return;

    if (document.hidden) {
      this.updateUser(this.state.user.email, { here: false });
    } else {
      this.updateUser(this.state.user.email, { here: true });
    }
  }

  //
  //
  // State functions
  //
  //

  startVideo(): void {
    const now = time.now();

    this.updateDateObject(this.state.available_date.id, { joined: now });

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
    const now = time.now();

    this.updateDateObject(this.state.available_date.id, {
      left: now,
      active: false
    }).then(() => {
      this.setState({
        app_state: APP_STATE.rating,
        active_video_session: false,
        video_session_time_remaining: {
          minutes: 999,
          seconds: 999
        }
      });
    });
  }

  rateDate(ratingType: string, value: boolean): void {
    this.updateDateObject(this.state.available_date.id, {
      [ratingType]: value
    });
  }

  restart(): void {
    const now = time.now();

    this.updateUser(this.state.user.email, {
      free: true,
      waitStartTime: now
    }).then(() => {
      this.setState({
        app_state: APP_STATE.waiting,
        active_video_session: false
      });
    });
  }

  redirectToApp() {
    this.setState({ redirecting: true });

    if (this.state.user)
      this.updateUser(this.state.user.email, { here: false });

      window.location.replace('https://live.bloomdating.app/');
    }

  renderView(): any {
    const VIEW_STATE: any = {
      waiting: (
        <WaitingRoom user={this.state.user} updateUser={this.updateUser}  />
      ),
      countdown: (
        <CountDown
          user={this.state.user}
          matching_user={this.state.matching_user}
          startVideo={this.startVideo}
        />
      ),
      video: (
        <Video
          user={this.state.user}
          matching_user={this.state.matching_user}
          available_date={this.state.available_date}
          endVideo={this.endVideo}
        />
      ),
      rating: (
        <Rating
          available_date={this.state.available_date}
          matching_user={this.state.matching_user}
          rateDate={this.rateDate}
          restart={this.restart}
          redirectToApp={this.redirectToApp}
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
              <React.Fragment>
                {this.state.app_state === APP_STATE.waiting && (
                  <IconButton
                    onClick={() => this.redirectToApp()}
                    aria-label="delete"
                  >
                    <CloseIcon className="close" />
                  </IconButton>
                )}
                <img src={logo} className="logo" alt="Bloom" />
              </React.Fragment>
            )}
          </Toolbar>
        </AppBar>
        <div className="app-content">{this.renderView()}</div>
      </div>
    );
  }
}
