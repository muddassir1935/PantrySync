const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const authMiddleware = require('../middlewares/authMiddleware');

// Fetch recipes by ingredients from Spoonacular
router.get('/findByIngredients', async (req, res) => {
  const { ingredients } = req.query;

  if (!ingredients) {
    return res.status(400).json({ error: 'Ingredients query parameter is required' });
  }

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients: ingredients,
        number: 12,
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching recipes:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular' });
  }
});


// Save a recipe to favorites
router.post('/save', authMiddleware, async (req, res) => {
  const { recipeId, title, image } = req.body;
  const userId = req.user.id;

  if (!recipeId || !title) {
    return res.status(400).json({ error: 'recipeId and title are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO saved_recipes (user_id, recipe_id, title, image) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, recipe_id) DO NOTHING RETURNING *',
      [userId, recipeId, title, image]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Recipe is already saved' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving recipe:', err.message);
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// Remove a recipe from favorites
router.delete('/save/:recipeId', authMiddleware, async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2 RETURNING *',
      [userId, recipeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found in favorites' });
    }

    res.json({ message: 'Recipe removed from favorites', recipe: result.rows[0] });
  } catch (err) {
    console.error('Error removing recipe:', err.message);
    res.status(500).json({ error: 'Failed to remove recipe' });
  }
});

// Get all saved recipes for user
router.get('/saved', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM saved_recipes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching saved recipes:', err.message);
    res.status(500).json({ error: 'Failed to fetch saved recipes' });
  }
});

// Get detailed recipe instructions
router.get('/:id/information', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error fetching recipe info:', err.message);
    res.status(500).json({ error: 'Failed to fetch recipe information' });
  }
});

module.exports = router;
