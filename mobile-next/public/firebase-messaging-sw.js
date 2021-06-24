importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js')

const firebaseConfig = {
  apiKey: 'AIzaSyDlfabwe9-Jc15KVmR1abBGdDgDp8b0iac',
  authDomain: 'bloom-dating.firebaseapp.com',
  databaseURL: 'https://bloom-dating.firebaseio.com',
  projectId: 'bloom-dating',
  storageBucket: 'bloom-dating.appspot.com',
  messagingSenderId: '671960082645',
  appId: '1:671960082645:web:a7867703decb3b8bc19a5c'
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()
