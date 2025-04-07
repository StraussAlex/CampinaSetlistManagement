const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const EVENTS_COLLECTON = "Events";

router.get('/', async(req, res) => {
    try{
        res.json(await req.db.collection(EVENTS_COLLECTON).find().toArray());
    } catch(e) {
        console.log(e);
    }
});

router.post('/', async(req, res) => {
  try {
    res.json(await req.db.collection(EVENTS_COLLECTON).insertOne(req.body));
    console.log("Inserted new event");
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;