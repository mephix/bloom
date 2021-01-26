import React from 'react';

import { db } from './config/firebase';

import './assets/css/App.css';

export default class App extends React.Component {
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