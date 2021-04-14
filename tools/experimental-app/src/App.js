import React, { useState, useEffect } from "react";
import components from "./components";
import { db } from "./firebase";
import "./styles.css";

const { CodeBlock } = components;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const [user, setUser] = useState();
  const [isFree, setIsFree] = useState();
  const [emailFromUrl] = useState(urlParams.get("email"));
  // const [isFree, setIsFree] = useState(false);

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
    if (user) setIsFree(user.free);
  }, [user]);

  useEffect(() => {
    if (isFree !== undefined)
      db.collection("Users").doc(emailFromUrl).update({ free: isFree });
  }, [emailFromUrl, isFree]);

  return (
    <div className="app">
      <CodeBlock value={user} />
      <CodeBlock value={isFree} />
      <button onClick={() => setIsFree((prev) => !prev)}>
        {isFree ? "free" : "notFree"}
      </button>
    </div>
  );
}

export default App;
