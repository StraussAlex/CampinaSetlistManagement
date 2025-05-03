const express = require('express');
const router = express.Router();

// Route to check if the user is authenticated (returns session info)
router.get('/', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;