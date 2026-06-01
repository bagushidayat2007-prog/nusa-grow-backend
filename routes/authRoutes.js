const express = require('express');
const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login endpoint ready',
    data: { token: 'dummy-token' }
  });
});

module.exports = router;