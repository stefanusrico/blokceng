const { initializeApp, getApps, getApp } = require("firebase/app")
const { getFirestore } = require("firebase/firestore")

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROEJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGE_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = process.env

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROEJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGE_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
}

let app

const initializeFirebaseApp = () => {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    }
    return app
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
  }
}

const getFirestoreInstance = () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  }

  return getFirestore(getApp())
}

module.exports = {
  initializeFirebaseApp,
  getFirestoreInstance,
}
