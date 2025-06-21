const express = require('express');
const router = express.Router();
const crypto = require('crypto');


const ACCOUNT_COLLECTION = 'Users';


// Hash Function copied from client/src/models/User.ts
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// Checks Credentials, Creates Session
router.post('/', async (req, res) => {
  try {
	console.log("login route hit")
	console.log('BODY:', req.body)
    const { password, username } = req.body;
    const account = await req.db
      .collection(ACCOUNT_COLLECTION)
      .findOne({ userName: username });
	console.log(account)
    if (!account) {
      return res.status(404).send('account not found');
    }
    const hashedPassword = await hashPassword(password);

    if (account.passwordHash !== hashedPassword) {
      return res.status(401).send('invalid password');
    }

    req.session.user = {
      id: account._id,
      userName: account.userName,
      isAdmin: account.isAdmin
    };

    res.json({
      message: 'Login successful',
      account: account.userName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});



router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful', redirect: '/' });
  });
});


module.exports = router;
