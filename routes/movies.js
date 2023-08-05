const express = require("express");
const router = express.Router();
const pool = require("../config/config");
const authMiddleware = require("../middleware/authMiddleware");

// Find movies list
router.get("/", authMiddleware, function (req, res) {
  const currentPage = req.query.page || 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const query = `
    SELECT movies.*
    FROM movies
    ORDER BY id
    LIMIT $1
    OFFSET $2
  `;
  const values = [itemsPerPage, offset];

  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while executing the query.",
      });
      throw err;
    } else {
      res.status(200).json(result.rows);
    }
  });
});

// Find movies by Id
router.get("/:id", authMiddleware, function (req, res) {
  const query = `SELECT movies.* FROM movies WHERE id = $1`;
  const values = [req.params.id];
  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while executing the query.",
      });
    } else {
      if (result.rows.length === 0) {
        return res.status(404).send("Movie not found");
      } else {
        res.status(200).json(result.rows[0]);
      }
    }
  });
});

// Add Movies to database
router.post("/", authMiddleware, async function (req, res) {
  const { id, title, genres, year } = req.body;
  try {
    const movieQuery = "SELECT * FROM movies WHERE id = $1";
    const movieResult = await pool.query(movieQuery, [id]);

    if (movieResult.rowCount > 0) {
      return res.status(400).json({
        status: "error",
        message: "Movie already exists.",
      });
    }

    const insertQuery = `
      INSERT INTO movies (id, title, genres, year)
      VALUES ($1, $2, $3, $4)`;
    const values = [id, title, genres, year];

    await pool.query(insertQuery, values);

    res.status(201).json({
      status: "Success add movie data",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while executing the query.",
    });
  }
});

// Edit movies data
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, genres, year } = req.body;
  try {
    const moviesQuery = "SELECT * FROM movies WHERE id = $1";
    const movieResult = await pool.query(moviesQuery, [req.params.id]);
    if (movieResult.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Movie not found.",
      });
    }
    const updateQuery = `
      UPDATE movies
      SET title = COALESCE ($1, title),
          genres = COALESCE ($2, genres),
          year = COALESCE ($3, year)
      WHERE id = $4`;
    const values = [title, genres, year, req.params.id];

    await pool.query(updateQuery, values);

    res.status(201).json({
      status: "Success update movie data",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while executing the query.",
    });
  }
});

// Delete movie data
router.delete("/:id", authMiddleware, async function (req, res) {
  try {
    const checkQuery = `SELECT id FROM movies WHERE id = $1`;
    const checkValues = [req.params.id];

    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Movie not found.",
      });
    } else {
      const deleteQuery = `DELETE FROM movies WHERE id = $1`;
      const deleteValues = [req.params.id];

      await pool.query(deleteQuery, deleteValues);

      res.status(200).json({
        status: "Success deleted movie",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while executing the query.",
    });
  }
});

module.exports = router;
