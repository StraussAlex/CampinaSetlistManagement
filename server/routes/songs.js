const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const SONG_COLLECTION = "Songs";

router.get('/', async(req, res) => {
  try {
    res.json(await req.db.collection(SONG_COLLECTION).find().toArray());
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

module.exports = router;
