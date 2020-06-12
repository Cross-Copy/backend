const { admin } = require ('./admin');

module.exports = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
      console.error('no token found');
      return res.status(403).json({error: 'Unauthorized'});
    }
  
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return next();
      //return db.collection('users').doc(decodedToken.uid).get();
    })
    .catch(err => {
      console.error ('Error while verifying token ', err);
      return res.status(403).json(err);
    })
  }