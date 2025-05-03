const express = require('express');
const router = express.Router();

const ACCOUNT_COLLECTION = 'Users';

// ! AUTO ADMIN CREATION - DELETE BEFORE PRODUCTION
router.get('/ensure-admin', async (req, res) => {
  try {
    const existing = await req.db.collection(ACCOUNT_COLLECTION).findOne({ userName: 'admin' })

    if (!existing) {
      await req.db.collection(ACCOUNT_COLLECTION).insertOne({
        userName: 'admin',
        passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
        isAdmin: true
      })
      console.log('Default admin user created')
    }

    res.status(200).json({ message: 'Checked and created if necessary' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Error checking default data' })
  }
})
// ! END OF "TO DELETE"


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
    const { username, password } = req.body;
    const account = await req.db
      .collection(ACCOUNT_COLLECTION)
      .findOne({ userName: username });

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
