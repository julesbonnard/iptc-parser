const express = require("express");
const app = express();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: "15mb" } });

const iptc = require("node-iptc");

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.post("/", upload.single("image"), (req, res, next) => {
  const iptcData = iptc(req.file.buffer);
  if (iptcData) return res.json(iptcData);
  next("Error while parsing IPTC");
});

app.use(express.static("public"));

app.listen(3000, function() {
  console.log("IPTC-parser listening on port 3000!");
});
