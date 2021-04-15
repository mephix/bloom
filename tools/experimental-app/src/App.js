import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import "./styles.css";
import matchmaker from './matchmaker/matchmaker.js'

// import components from "./components";
// const { CodeBlock } = components;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const [user, setUser] = useState();
  const [isHereAndFree, setIsHereAndFree] = useState();
  const [emailFromUrl] = useState(urlParams.get("email"));
  const [timer, setTimer] = useState();

  useEffect(() => {
    if (emailFromUrl) {
      db.collection("Users")
        .doc(emailFromUrl)
        .onSnapshot((doc) => {
          setUser(doc.data());
        });
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (user) setIsHereAndFree(user.here && user.free);
  }, [user]);

  useEffect(() => {
    if (isHereAndFree !== undefined) {
      db.collection("Users").doc(emailFromUrl).update({
        // setting them both with their common value
        here: isHereAndFree,
        free: isHereAndFree
      });
    }
    if (isHereAndFree === true) {
      console.log('Starting matchmaker')
      matchmaker(setTimer)
    }
    if (isHereAndFree === false) {
      console.warn('Stopping matchmaker')
      clearTimeout(timer)
    }
  }, [emailFromUrl, isHereAndFree, timer]);

  return (
    <div className="app">
      <div>{`user.here and user.free in Firebase: ${user?.here && user?.free}`}</div>
      <div>{`isHereAndFree: ${isHereAndFree}`}</div>
      <button onClick={() => setIsHereAndFree((prev) => !prev)}>
        {isHereAndFree ? "free" : "notFree"}
      </button>
    </div>
  );
}

export default App;
