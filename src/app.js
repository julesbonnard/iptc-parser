const express = require("express");
const cors = require("cors");
const app = express();

const iptcParser = require("./iptc-parser");

app.use(cors());

app.use("/", iptcParser);

app.use(express.static("public"));

app.listen(3000, function() {
  console.log("IPTC-parser listening on port 3000!");
});
