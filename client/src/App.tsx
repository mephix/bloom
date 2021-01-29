import React from 'react';

import { db } from './config/firebase';

import './assets/css/App.css';

const APP_STATE = {
  'waiting': 'Waiting Room',
  'countdown': 'Countdown',
  'video': 'Video Chat',
  'rating': 'Rating Screen'
}

type Props = {};

export default class App extends React.Component<Props> {
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
    db.collection("Dates").where("ready", "==", true)
      .onSnapshot((querySnapshot) => {
          var dates: any[] = [];
          querySnapshot.forEach((doc) => {
            dates.push(doc.data());
          });
          console.log("Dates that are ready ", dates);
      });
  }

  render() {
    return (
      <div className="App">
        ...
      </div>
    );
  }
}