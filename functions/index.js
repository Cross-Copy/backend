const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({origin: true}));

const { admin } = require ("./util/admin");

const { getAllTextClips, addTextClip, deleteTextClip } = require('./handlers/text-clips');
const { getAllImageClips, addImageClip, deleteImageClip } =require('./handlers/image-clips');
const { signUp, login, getAllOnAUser} = require('./handlers/users');
const FBAuth = require ('./util/auth');

// User signup and login routes
app.post("/signup", signUp);
app.post("/login", login);

app.get("/user/all", FBAuth, getAllOnAUser);

// Text Clip Routes
app.get("/text", FBAuth, getAllTextClips);
app.post("/text", FBAuth, addTextClip);
app.delete("/text/:clipId", FBAuth, deleteTextClip);

//Image Clip Routes
app.get("/image", FBAuth, getAllImageClips)
app.post("/image", FBAuth, addImageClip);
app.delete("/image/:clipId", FBAuth, deleteImageClip);

exports.api = functions.https.onRequest(app);

exports.onDeleteImage = functions.firestore
  .document('users/{uid}/image/{imageId}')
  .onDelete((snap, context) => {
    console.log('DELETE DETECTED');
    console.log(`////// ${context.params} ////////`);
    const { imageId } = context.params;
    const bucket = admin.storage().bucket();

    const path = `images/${imageId}`;

    return bucket.file(path).delete();
  });