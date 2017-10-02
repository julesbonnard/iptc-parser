const fs = require("fs");
const path = require("path");

const express = require("express");
const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "/tmp/iptc-parser",
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  var mimetype = filetypes.test(file.mimetype);
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Error: File upload only supports the following filetypes - " + filetypes);
};

const fileLimits = {
  fileSize: "15MB",
  files: 10
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: fileLimits
});

const iptc = require("node-iptc");

router.post("/", upload.any(), (req, res, next) => {
  if (!req.files || !Array.isArray(req.files))
    return next("Error while uploading files");

  const iptcPromises = req.files.map(file => {
    return Promise.resolve(file)
      .then(readFile)
      .then(getIptc)
      .then(formatData)
      .catch(err => {
        return {
          iptc: false,
          name: err.originalname,
          err: err.stack
        };
      });
  });

  Promise.all(iptcPromises)
    .then(results => res.json(results))
    .catch(err => next(err));
});

function readFile(fileData) {
  return new Promise((fulfill, reject) => {
    fs.readFile(fileData.path, (err, data) => {
      if (err)
        return reject({
          originalname: fileData.originalname,
          err: err
        });
      fileData.data = data;
      fs.unlink(fileData.path, err => {
        if (err)
          return reject({
            originalname: fileData.originalname,
            err: err
          });
        fulfill(fileData);
      });
    });
  });
}

function getIptc(fileData) {
  try {
    const iptcData = iptc(fileData.data);
    fileData.iptc = iptcData;
    return Promise.resolve(fileData);
  } catch (err) {
    return Promise.reject({
      originalname: fileData.originalname,
      err: err
    });
  }
}

function formatData(fileData) {
  const newFileData = {
    name: fileData.originalname,
    mimetype: fileData.mimetype,
    iptc: fileData.iptc
  };
  return Promise.resolve(newFileData);
}

module.exports = router;
