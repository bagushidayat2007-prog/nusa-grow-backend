const express = require('express');
const router = express.Router();

// GET /api/v1/products
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Products endpoint ready',
    data: []
  });
});

// GET /api/v1/products/:slug
router.get('/:slug', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Product detail endpoint ready',
    data: null
  });
});

module.exports = router;