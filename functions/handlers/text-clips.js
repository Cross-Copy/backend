const { db } = require ('../util/admin');

// GET All Text Clips
exports.getAllTextClips = (req, res) => {
  db.collection("users")
    .doc(req.user.uid)
    .collection("text")
    .orderBy("uploadedOn", "desc")
    .get()
    .then((data) => {
      let clippings = [];
      data.forEach((doc) => {
        clippings.push({
          clipId: doc.id,
          body: doc.data().body,
          uploadedOn: doc.data().uploadedOn,
        });
      });
      return res.json(clippings);
    })
    .catch((err) => console.error(err));
};

// ADD Text Clip
exports.addTextClip = (req, res) => {
    const newClip = {
      uid: req.user.uid,
      body: req.body.body,
      uploadedOn: new Date().toISOString()
    }
  
    db
    .collection("users")
    .doc(newClip.uid)
    .collection("text")
    .add(newClip)
    .then((doc) => {
      return res.json({ message: `document ${doc.id} created.` });
    })
    .catch ((err) => {
      res.status(500).json ({error: err.code})
    })
};

// DELETE Text Clip
exports.deleteTextClip = (req, res) => {
  const document = db.doc(`/users/${req.user.uid}/text/${req.params.clipId}`);
  document.get()
  .then((doc) => {
    if (!doc.exists){
      return res.status(404).json({ error: 'text clip not found' });
    }
    return document.delete();
  })
  .then(() => {
    return res.json({ message: 'Text Clip deleted successfully' });
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({ error: err.code });
  });
};