require('dotenv').config();
var firebase = require('firebase');

// Initialize Firebase

var config = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID
};
firebase.initializeApp(config);

var db = firebase.firestore();

module.exports = { firebase , db };
