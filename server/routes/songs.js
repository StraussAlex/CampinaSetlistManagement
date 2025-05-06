const express = require('express');
const fs = require('fs');
const path = require('path');
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

router.get('/:id', async(req, res) => {
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
               notes: req.body.notes,
               files: req.body.files
      }}));
  } catch(error) {
    console.log(error);
  }
});


router.get('/download/:name', async(req, res) => {
  console.log("get request received")
  console.log(req.params.name)
  const path = "uploads/" + req.params.name;
  console.log(path)

  res.download(path, (err) => {
    if (err) {
      return res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });

  if (!req.params.name) {
    return res.status(400).send('Filepath is required.');
  }
});

module.exports = router;
