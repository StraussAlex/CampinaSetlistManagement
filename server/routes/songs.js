const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const SONG_COLLECTION = "Songs";

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get('/', async(req, res) => {
  try {
    res.json(await req.db.collection(SONG_COLLECTION).find().toArray());
  } catch(error) {
    console.log(error);
  }
});

router.get('/edit-song/:id', async(req, res) => {
  try {
    const event = await req.db.collection(SONG_COLLECTION).findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(event);
  } catch(error) {
    console.log(error);
  }
});

router.post('/', async(req, res) => {
  try {
    res.json(await req.db.collection(SONG_COLLECTION).insertOne(req.body));
    console.log("Inserted new song");
  } catch(error) {
    console.log(error);
  }
});
router.post('/upload', upload.any(), (req, res) => {
  try {
    console.log("upload request received")
    //res.json(await req.db.collection(SONG_COLLECTION).insertOne(req.body));
    if (!req.files){
      return res.status(400).send('No file uploaded.');
    } else {
      res.json(req.files);
    }
  } catch(error) {
    console.log(error);
  }
});
router.delete('/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(SONG_COLLECTION).deleteOne({_id: new ObjectId(req.params.id)}));
  } catch(error) {
    console.log(error);
  }
});

router.put('/edit-song/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(SONG_COLLECTION).updateOne(
      {_id: new ObjectId(req.params.id)},
      { $set: {title: req.body.title,
               artist: req.body.artist,
               lyrics: req.body.lyrics,
               links: req.body.links,
               files: req.body.files
      }}));
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;
