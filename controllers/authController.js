const pool = require("../config/config");
const bcrypt = require("bcryptjs");
const signToken = require("../utils/authentication");

exports.signup = async (req, res) => {
  const { id, email, password, role } = req.body;

  // Pengecekan apakah email atau password kosong
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "email and password are required.",
    });
  }

  try {
    // Pengecekan apakah email sudah terdaftar
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rowCount > 0) {
      return res.status(400).json({
        status: "error",
        message: "email already exists.",
      });
    }

    // Password Encryption
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Simpan user baru ke dalam database
    const insertQuery =
      "INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)";
    await pool.query(insertQuery, [id, email, hashedPassword, role]);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while registering user.",
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    if (
      userResult.rowCount === 0 ||
      !bcrypt.compareSync(password, userResult.rows[0].password)
    ) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const token = signToken(email);
    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      key: token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "An error occurred while logging in.",
    });
  }
};
