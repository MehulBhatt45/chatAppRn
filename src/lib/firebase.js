import * as firebase from 'firebase';
// import myFirebaseConfig from 'config/firebase';

const firebaseConfig = {
	apiKey: "AIzaSyAREdI1ZW0Vfni3HrjjCTVQxKhjE6UayA8",
	authDomain: "myreactnativechat.firebaseapp.com",
	databaseURL: "https://myreactnativechat.firebaseio.com",
	projectId: "myreactnativechat",
	storageBucket: "myreactnativechat.appspot.com",
	messagingSenderId: "845665334846"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase;
