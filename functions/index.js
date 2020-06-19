const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({origin: true}));

const { admin } = require ("./util/admin");

const { getAllTextSnips, addTextSnip, updateTextSnip, deleteTextSnip } = require('./handlers/text-snips');
const { getAllImageSnips, addImageSnip, deleteImageSnip } =require('./handlers/image-snips');
const { signUp, login, getAllOnAUser} = require('./handlers/users');
const FBAuth = require ('./util/auth');

// User signup and login routes
app.post("/signup", signUp);
app.post("/login", login);

app.get("/user/all", FBAuth, getAllOnAUser);

// Text Snip Routes
app.get("/text/:workspace", FBAuth, getAllTextSnips);
app.post("/text/:workspace", FBAuth, addTextSnip);
app.patch("/text/:workspace/:snipId", FBAuth, updateTextSnip);
app.delete("/text/:workspace/:snipId", FBAuth, deleteTextSnip);

//Image Snip Routes
app.get("/image/:workspace", FBAuth, getAllImageSnips)
app.post("/image/:workspace", FBAuth, addImageSnip);
app.delete("/image/:workspace/:snipId", FBAuth, deleteImageSnip);

exports.api = functions.https.onRequest(app);

exports.onDeleteImage = functions.firestore
  .document('users/{uid}/workspace/{workspace}/image/{imageId}')
  .onDelete((snap, context) => {
    console.log('DELETE DETECTED');
    console.log(`////// ${context.params.uid} ////////`);
    const { uid, imageId } = context.params;
    const bucket = admin.storage().bucket();

    const path = `${uid}/images/${imageId}`;

    return bucket.file(path).delete();
  });