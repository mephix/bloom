import React from 'react';

import { db } from './config/firebase';

import './assets/css/App.css';

type AppState = {
  'waiting': string,
  'countdown': string,
  'video': string,
  'rating': string
};

type Props = {};

type State = {
  user: any,
  date: any,
  app_state: string
}

const APP_STATE: AppState = {
  'waiting': 'waiting',
  'countdown': 'countdown',
  'video': 'video',
  'rating': 'rating'
}

const VIEW_STATE: any = {
  'waiting': <div>Waiting room component</div>,
  'countdown': <div>Countdown component</div>,
  'video': <div>Video component</div>,
  'rating': <div>Rating component</div>
}

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
      date: null,
      app_state: APP_STATE.waiting
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');

    if (uid) {
      // Look user up by uid, then do things

      db.collection("Dates").where("ready", "==", true)
      .onSnapshot((querySnapshot) => {
          var dates: any[] = [];
          querySnapshot.forEach((doc) => {
            dates.push(doc.data());
          });
          console.log("Dates that are ready ", dates);
      });
    }
  }

  render() {
    return (
      <div className="App">
        {VIEW_STATE[this.state.app_state]}
      </div>
    );
  }
}