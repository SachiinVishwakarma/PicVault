// routes/imageRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Image = require("../models/Image");
const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// GET home page
router.get("/", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.render("index", { images });
  } catch (err) {
    console.error("Error loading images:", err);
    res.status(500).send("Error loading images");
  }
});
router.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const imagePath = path.join(__dirname, "..", image.path);
    res.set("Content-Type", image.mimetype);
    fs.createReadStream(imagePath).pipe(res);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ message: "Error fetching image" });
  }
});
// POST upload image
router.post("/upload", upload.single("profile"), async (req, res) => {
  try {
    const image = new Image({
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    await image.save();
    res.redirect("/");
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Upload failed");
  }
});

// POST delete image
router.post("/delete/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).send("Image not found");
    }

    // Ensure the path is valid before deleting
    if (image.path && typeof image.path === 'string') {
      fs.unlinkSync(path.resolve(image.path));
    }

    await Image.deleteOne({ _id: req.params.id });
    res.redirect("/");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("Failed to delete image");
  }
});

module.exports = router;