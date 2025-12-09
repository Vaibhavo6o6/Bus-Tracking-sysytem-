const firebaseConfig = {
  apiKey: "AIzaSyAZUaLXmss_Heh6nKdeb385Mop-oiYhIHM",
  authDomain: "bus-tracking-12915.firebaseapp.com",
  databaseURL: "https://bus-tracking-12915-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bus-tracking-12915",
  storageBucket: "bus-tracking-12915.firebasestorage.app",
  messagingSenderId: "269054792297",
  appId: "1:269054792297:web:19ef7bedc3de2d1a5888f8",
  measurementId: "G-JBYNDQ1KCE"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("Firebase connected:", "go");
