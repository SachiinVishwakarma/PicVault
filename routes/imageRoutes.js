const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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

// Store uploaded file metadata in memory (array)
let uploadedImages = [];

// GET home page
router.get("/", (req, res) => {
  // Sort by time descending
  const images = [...uploadedImages].sort((a, b) => b.timestamp - a.timestamp);
  res.render("index", { images });
});

// GET image by file name (for direct access)
router.get("/image/:filename", (req, res) => {
  const filePath = path.join(__dirname, "..", "uploads", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Image not found");
  }
});

// POST upload image
router.post("/upload", upload.single("profile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const fileData = {
    filename: req.file.filename,
    path: req.file.path,
    mimetype: req.file.mimetype,
    size: req.file.size,
    timestamp: Date.now()
  };

  uploadedImages.push(fileData);
  res.redirect("/");
});

// POST delete image
router.post("/delete/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log("Requested to delete:", filename);

  const fileIndex = uploadedImages.findIndex(img => img.filename === filename);
  console.log("Found index:", fileIndex);

  if (fileIndex === -1) {
    console.log("Image not found in memory list");
    return res.status(404).send("Image not found");
  }

  const filePath = path.resolve("uploads", filename);
  console.log("Resolved path:", filePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("File deleted from disk");
  } else {
    console.log("File not found on disk");
  }

  uploadedImages.splice(fileIndex, 1);
  console.log("Image removed from memory list");

  res.redirect("/");
});


module.exports = router;
