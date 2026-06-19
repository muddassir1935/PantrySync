const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

// Get the user's saved calendar
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT calendar_data FROM user_calendars WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ calendar: null });
    }

    res.json({ calendar: result.rows[0].calendar_data });
  } catch (err) {
    console.error('Error fetching calendar:', err.message);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Update the user's saved calendar
router.put('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { calendar } = req.body;

  if (!calendar) {
    return res.status(400).json({ error: 'Calendar data is required' });
  }

  try {
    // Upsert the calendar data (insert if not exists, update if exists)
    const result = await db.query(
      `INSERT INTO user_calendars (user_id, calendar_data, last_updated) 
       VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (user_id) 
       DO UPDATE SET calendar_data = EXCLUDED.calendar_data, last_updated = CURRENT_TIMESTAMP 
       RETURNING *`,
      [userId, JSON.stringify(calendar)]
    );

    res.json({ message: 'Calendar updated successfully', calendar: result.rows[0].calendar_data });
  } catch (err) {
    console.error('Error updating calendar:', err.message);
    res.status(500).json({ error: 'Failed to update calendar' });
  }
});

module.exports = router;
