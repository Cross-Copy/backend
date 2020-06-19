const { db } = require("../util/admin");
const config = require("../util/config");
const firebase = require("firebase");
firebase.initializeApp(config);

const { validateSignUpData, validateLoginData } = require("../util/validators");

// SIGN UP
exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  const { valid, errors } = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

  let token, uid;
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      uid = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCred = {
        email: newUser.email,
        darkTheme: false,
        joinDate: new Date().toISOString()
      };
      return db.doc(`/users/${uid}`).set(userCred);
    })
    .then(() => {
      return res.status(201).json({
        message: `user ${uid} with token ${token} signed up sucessfully`,
      });
    })
    .catch((err) => {
      console.log(err);

      if (err.code === "auth/email-already-in-use") {
        return res.status(403).json({ general: `Email already registered.` });
      }else{ 
        return res.status(500).json({ general: 'Something went wrong. Please try again.' });
      }
    });
};

// LOGIN
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.log(err);

      // Two types of login auth fails
      // auth/user-not-found
      // auth/wrong-password
      return res
        .status(403)
        .json({ general: `Wrong credentials, please try again` });
    });
};

exports.getAllOnAUser = (req, res) => {
  let userData = {};
  //db.doc("/users/${req.user.uid}").get()
  db.collection("users")
  .doc(req.user.uid)
  .get()
  .then((doc) => {
    if (doc.exists){
      userData.email = doc.data().email;
      userData.darkTheme = doc.data().darkTheme;
      userData.joinDate = doc.data().joinDate;
      //userData.text = doc.data().text;
      
    }
    return res.json(userData);
  })
  .catch ((err) => {
    res.status(500).json ({error: err.code});
  });
};
