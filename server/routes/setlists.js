const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');
const SETLIST_COLLECTION = "Setlists";

router.get('/', async(req, res) => {
  try {
    res.json(await req.db.collection(SETLIST_COLLECTION).find().toArray());
  } catch(error) {
    console.log(error);
  }
});

router.get('/edit-setlist/:id', async (req, res) => {
 try {
    const setlist = await req.db.collection(SETLIST_COLLECTION).findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(setlist);
  } catch (error) {
    console.error(error);
  }
});

router.get('/:id', async (req, res) => {
 try {
    const setlist = await req.db.collection(SETLIST_COLLECTION).findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(setlist);
  } catch (error) {
    console.error(error);
  }
});

router.post('/', async(req, res) => {
  try {
    res.json(await req.db.collection(SETLIST_COLLECTION).insertOne(req.body));
    console.log("Inserted new setlist");
  } catch(error) {
    console.log(error);
  }
});

router.put("/edit-setlist/:id", async (req, res) => {
  try {
      res.json(
          await req.db.collection(SETLIST_COLLECTION).updateOne(
              { _id: new ObjectId(req.params.id) },
              { $set: {name: req.body.name,
                       songs: req.body.songs } }
          )
      );
  } catch (error) {
      console.log(error);
  }
});
router.delete('/:id', async(req, res) => {
  try {
    res.json(await req.db.collection(SETLIST_COLLECTION).deleteOne({_id: new ObjectId(req.params.id)}));
  } catch(error) {
    console.log(error);
  }
});

module.exports = router;
