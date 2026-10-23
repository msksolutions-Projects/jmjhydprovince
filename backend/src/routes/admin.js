const express = require('express');
const { protect } = require('../middleware/auth');
const News = require('../models/News');
const Notice = require('../models/Notice');
const Gallery = require('../models/Gallery');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const newsCount = await News.countDocuments();
    const noticesCount = await Notice.countDocuments();
    const galleryCount = await Gallery.countDocuments();
    
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    
    const unreadMessages = await ContactMessage.countDocuments({ status: 'new' });
    const totalMessages = await ContactMessage.countDocuments();

    const recentNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalNews: newsCount,
        totalNotices: noticesCount,
        totalGalleries: galleryCount,
        publishedNews,
        draftNews,
        unreadMessages,
        totalMessages,
        recentNews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stats'
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const totalViews = await News.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const topNews = await News.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views');

    res.status(200).json({
      success: true,
      data: {
        totalViews: totalViews[0]?.totalViews || 0,
        topNews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics'
    });
  }
});

module.exports = router;
