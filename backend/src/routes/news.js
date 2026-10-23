const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const c = require('../controllers/newsController');

const router = express.Router();

router.get('/', optionalAuth, c.getNews);
router.get('/search', c.searchNews);
router.get('/featured', c.getFeaturedNews);
router.get('/:id', optionalAuth, c.getSingleNews);

router.post('/', protect, c.createNews);
router.put('/:id', protect, c.updateNews);
router.patch('/:id', protect, c.updateNews);
router.delete('/:id', protect, c.deleteNews);

module.exports = router;
