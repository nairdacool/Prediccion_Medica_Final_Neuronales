const admin = require('firebase-admin');
let enfermedadClave = require('../enfermedades.json');

admin.initializeApp({
    credential: admin.credential.cert(enfermedadClave)
});


const db = admin.firestore()

module.exports = db