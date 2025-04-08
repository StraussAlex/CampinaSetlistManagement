const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const ACCOUNT_COLLECTION = "Users";

router.get('/', async(req, res) => {
  try {
    res.json(await req.db.collection(ACCOUNT_COLLECTION).find().toArray());
  } catch(error) {
    console.log(error);
  }
});
router.get('/by-name/:username', async(req, res) => {
  try {
    res.json(await req.db.collection(ACCOUNT_COLLECTION).find({ userName: req.params.username }).toArray());
  } catch(error) {
    console.log(error);
  }
});

router.post('/', async(req, res) => {
  try {
    res.json(await req.db.collection(ACCOUNT_COLLECTION).insertOne(req.body));
    console.log("Inserted new user");
  } catch(error) {
    console.log(error);
  }
});

router.delete('/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(ACCOUNT_COLLECTION).deleteOne({_id: new ObjectId(req.params.id)}));
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;
