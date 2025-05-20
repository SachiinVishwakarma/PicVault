// server.js
const express = require("express");
const path = require("path");
const imageRoutes = require("./routes/imageRoutes");
const app = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads")); // Serve uploaded images

// Routes
app.use("/", imageRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
