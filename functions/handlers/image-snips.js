const { db, admin } = require ('../util/admin');
const config = require("../util/config");

exports.getAllImageSnips = (req, res) => {
    db.collection(`/users/${req.user.uid}/workspace/${req.params.workspace}/image`)
    //.orderBy("uploadedOn", "desc")
    .get()
    .then((data) => {
        let snippings = [];
        data.forEach((doc) => {
          snippings.push({
            snipId: doc.id,
            imageUrl: doc.data().imageUrl,
            //imageName: doc.data().imageName,
            uploadedOn: doc.data().uploadedOn,
            lastUpdatedOn: doc.data().lastUpdatedOn
          });
        });
        return res.json(snippings);
    })
    .catch((err) => console.error(err));   
};


exports.addImageSnip = (req, res) => {
    const BusBoy = require ('busboy');
    const path = require ('path');
    const os = require ('os');
    const fs = require ('fs');

    const busboy = new BusBoy({headers: req.headers});

    let imageFileName;
    let image = {};
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        
        if (mimetype.substring(0,6) !== `image/`){
            return res.status(403).json({message: 'invalid file type.'});
        }

        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        
        //Random number string for imageFileName
        imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);

        image = {filepath, mimetype};
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(image.filepath, {
            resumable: false,
            destination: `${req.user.uid}/images/${imageFileName}`,
            metadata: {
                metadata: {
                    contentType: image.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/images/${imageFileName}?alt=media`;
            return db
            .collection('users')
            .doc(req.user.uid)
            .collection('workspace')
            .doc(req.params.workspace)
            .collection('image')
            .doc(imageFileName).set({ 
                //imageName: imageFileName,
                imageUrl, 
                uploadedOn: new Date().toISOString(), 
                lastUpdatedOn: new Date().toISOString()
            });

        })
        .then(() => {
            return res.json({ message: `image uploaded.`});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error:err.code });
        });
    });

    busboy.end(req.rawBody);
};


// DELETE Image Snip
exports.deleteImageSnip = (req, res) => {
    const document = db.doc(`/users/${req.user.uid}/workspace/${req.params.workspace}/image/${req.params.SnipId}`);
    document.get()
    .then((doc) => {
      if (!doc.exists){
        return res.status(404).json({ error: 'image snip not found' });
      }
      return document.delete();
    })
    .then(() => {
      return res.json({ message: 'Image Snip deleted successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
  };