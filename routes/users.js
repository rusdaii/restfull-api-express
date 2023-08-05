const express = require("express");
const router = express.Router();
const pool = require("../config/config");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

// Find all users list
router.get("/", authMiddleware, function (req, res) {
  const currentPage = req.query.page || 1;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const query = `
    SELECT users.* 
    FROM users
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

// Find User by Id
router.get("/:id", authMiddleware, function (req, res) {
  const query = `SELECT users.* FROM users WHERE id = $1`;
  const values = [req.params.id];
  pool.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while executing the query.",
      });
    } else {
      if (result.rows.length === 0) {
        return res.status(404).send("User not found");
      } else {
        res.status(200).json(result.rows[0]);
      }
    }
  });
});

// Edit user data
router.put("/:id", authMiddleware, async (req, res) => {
  const { email, gender, password, role } = req.body;

  try {
    const userQuery = "SELECT * FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [req.params.id]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } else {
      hashedPassword = userResult.rows[0].password;
    }

    const updateQuery = `
      UPDATE users
      SET email = COALESCE($1, email),
          gender = COALESCE($2, gender), 
          password = $3, 
          role = COALESCE($4, role) 
      WHERE id = $5`;
    const values = [email, gender, hashedPassword, role, req.params.id];

    await pool.query(updateQuery, values);

    res.status(201).json({
      status: "Success updated user data",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while executing the query.",
    });
  }
});

// Delete user data
router.delete("/:id", authMiddleware, async function (req, res) {
  try {
    const checkQuery = `SELECT id FROM users WHERE id = $1`;
    const checkValues = [req.params.id];

    const checkResult = await pool.query(checkQuery, checkValues);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    } else {
      const deleteQuery = `DELETE FROM users WHERE id = $1`;
      const deleteValues = [req.params.id];

      await pool.query(deleteQuery, deleteValues);

      res.status(200).json({
        status: "Success deleted user",
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
