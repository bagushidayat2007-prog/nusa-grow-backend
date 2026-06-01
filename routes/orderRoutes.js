const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Order created', data: null });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, data: null });
});

module.exports = router;