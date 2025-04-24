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

router.get('/:id', async (req, res) => {
 try {
    const event = await req.db.collection(EVENTS_COLLECTON).findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(event);
  } catch (error) {
    console.error(error);
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
router.delete('/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(EVENTS_COLLECTON).deleteOne({_id: new ObjectId(req.params.id)}));
  } catch(error) {
    console.log(error);
  }
});

router.put('/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(EVENTS_COLLECTON).updateOne(
      {_id: new ObjectId(req.params.id)},
      { $set: {name: req.body.name,
               location: req.body.location,
               date: req.body.date,
               setlistIds: req.body.setlistIds
      }}));
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;