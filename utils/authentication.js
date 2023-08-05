const jwt = require("jsonwebtoken");

const signToken = (data) => {
  const token = jwt.sign({ data }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};

module.exports = signToken;
