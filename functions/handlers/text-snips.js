const { db } = require("../util/admin");

// GET All Text Snips
exports.getAllTextSnips = (req, res) => {
  db.collection("users")
    .doc(req.user.uid)
    .collection("workspace")
    .doc(req.params.workspace)
    .collection("text")
    .orderBy("uploadedOn", "desc")
    .get()
    .then((data) => {
      let snippings = [];
      data.forEach((doc) => {
        snippings.push({
          snipId: doc.id,
          body: doc.data().body,
          uploadedOn: doc.data().uploadedOn,
          lastUpdatedOn: doc.data().lastUpdatedOn,
        });
      });
      return res.json(snippings);
    })
    .catch((err) => console.error(err));
};

// ADD Text Snip
exports.addTextSnip = (req, res) => {
  const newSnip = {
    uid: req.user.uid,
    body: req.body.body,
    uploadedOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
  };

  db.collection("users")
    .doc(newSnip.uid)
    .collection("workspace")
    .doc(req.params.workspace)
    .collection("text")
    .add(newSnip)
    .then((doc) => {
      return res.json({
        snipId: doc.id,
        body: newSnip.body,
        uploadedOn: newSnip.uploadedOn,
        lastUpdatedOn: newSnip.lastUpdatedOn
      })///{ message: `document ${doc.id} created.`, doc: newSnip });
    })
    .catch((err) => {
      res.status(500).json({ error: err.code });
    });
};

//Update a Text Snip
exports.updateTextSnip = (req, res) => {
  db.doc(
    `/users/${req.user.uid}/workspace/${req.params.workspace}/text/${req.params.snipId}`
  )
    .update({
      body: req.body.body,
      lastUpdatedOn: new Date().toISOString(),
    })
    .then((doc) => {
      return res.json({ message: `document updated.` });
    })
    .catch((err) => {
      res.status(500).json({ error: err.code });
    });
};

// DELETE Text Snip
exports.deleteTextSnip = (req, res) => {
  const document = db.doc(
    `/users/${req.user.uid}/workspace/${req.params.workspace}/text/${req.params.snipId}`
  );
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "text snip not found" });
      }
      return document.delete();
    })
    .then(() => {
      return res.json({ message: "Text snip deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
