const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const moviesRouter = require("./movies");
const authUsersRoute = require("./authUsers");
const users = require("./users");
const swaggerJson = require("../swagger.json");

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

// Body Parser
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Endpoint
router.use("/auth", authUsersRoute);
router.use("/movies", moviesRouter);
router.use("/users", users);

module.exports = router;
