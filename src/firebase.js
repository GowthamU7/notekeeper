import { initializeApp } from "firebase/app";

import { getFirestore} from "@firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDNK6l4k8gFyIOF7X2EYOsO1PdXombXY3M",
  authDomain: "notekeeper-626bf.firebaseapp.com",
  projectId: "notekeeper-626bf",
  storageBucket: "notekeeper-626bf.appspot.com",
  messagingSenderId: "541620876498",
  appId: "1:541620876498:web:1c93d48ced02fa8f4d690b",
  measurementId: "G-F0P97XFJQQ"
};


  const app = initializeApp(firebaseConfig)

  export const db = getFirestore(app)


