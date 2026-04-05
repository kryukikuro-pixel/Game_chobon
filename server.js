const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dev", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dev.html"));
});

app.listen(PORT, () => {
  console.log(`Sanabi preview server running on port ${PORT}`);
});