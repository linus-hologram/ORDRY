const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const uuid = require("uuid/v1");
const fs = require("fs");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const ChecklistItem = require("../models/ChecklistItem"); // get the model

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./checklist-uploads");
  },
  filename: function(req, file, callback) {
    callback(
      null,
      file.mimetype === "image/jpeg"
        ? uuid() + ".jpeg"
        : file.mimetype === "image/png"
        ? uuid() + ".png"
        : uuid() + ".jpg"
    );
  }
});

const fileFilter = (req, file, callback) => {
  // reject a file
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Incorrect file");
    error.code = "INCORRECT_FILETYPE";
    // error occured
    return callback(error, false);
  }
  callback(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 3 // files with maximum 3 MB
  },
  fileFilter: fileFilter
});

// Routes

router.get("/getall", async (req, res, next) => {
  try {
    const citems = await getAllItems();
    res.status(200).json(citems);
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllOfSection/:id", async (req, res, next) => {
  const sid = req.params.id;

  if (sid != 0 && sid != 1) {
    // the section id must either be 0 (for the first list) or 1 (for the end list)
    return res.status(400).json({
      message: "The section id must be specified along with the url and must be either 0 or 1!"
    });
  }

  try {
    const citems = await getItemsOfSection(sid);
    res.status(200).json(citems);
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/additem", upload.single("checklist-image"), async (req, res, next) => {
  const file = req.file;

  try {
    const sectionID = parseInt(req.body.section, 10);

    if (typeof sectionID != "number") {
      await Promise.reject(400);
    }

    if (sectionID != 0 && sectionID != 1) {
      await Promise.reject(400);
    }

    const cicount = await getItemCount(req.body.section);

    const citem = new ChecklistItem({
      _id: ObjectId(),
      title: req.body.title,
      position: cicount > 0 ? cicount : 0,
      sectionId: req.body.section,
      imageId: file ? file.filename : ""
    });

    const result = await createItem(citem);

    res.status(result).json({
      // send back the created item
      message: "Successfully created the new Item!",
      createdItem: citem
    });
  } catch (error) {
    res.status(error).json({
      message:
        error === 500
          ? "An unexpected error occured."
          : "Bad Request. Section ID must be a number between 0 and 1!"
    }); // send back as json
  }
});

router.delete("/delete", async (req, res, next) => {
  const id = req.body.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "The id must be specified and has to be a valid MongoDB Object-ID!"
    });
  }

  try {
    const docToDelete = await getItemWithId(id);
    if (docToDelete.imageId != "") fs.unlinkSync("checklist-uploads/" + docToDelete.imageId);

    const result = await deleteItem(id);
    console.log(result);
    res.status(200).json({ message: "Successfully deleted the specified item!" });
  } catch (error) {
    console.log(error);
    if (error === 404) {
      return res.status(404).json({ message: "No such file found!" });
    }
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

router.patch("/updateItem", upload.single("checklist-image"), async (req, res, next) => {
  const title = req.body.title;
  const section = req.body.section;
  const id = req.body.id;
  const file = req.file;

  if (
    title === undefined ||
    section === undefined ||
    typeof section === "number" ||
    id === undefined ||
    !ObjectId.isValid(id)
  ) {
    return res.status(400).json({
      message:
        "Please specify the desired title, section and optionally the file and ensure that the id is specified and a valid MongoDB Object-ID!"
    });
  }

  try {
    if (file) {
      // the file should be updated AND the old file must be deleted
      const item = await getItemWithId(id);
      fs.unlink("./checklist-uploads/" + item.imageId, err => {
        console.log("File could not be deleted!");
      });

      await updateItemImage(id, file.filename);
      console.log("Old image was deleted and new one set");
    }

    const result = await updateItem(id, title, section);
    const item = await getItemWithId(id);

    if (result == 200) {
      res.status(200).json({ message: "Successfully patched the specified item!", item: item });
    } else res.status(404).json({ message: "404. Item not found by ID." });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." });
  }
});

router.patch("/updateItemOrder", async (req, res, next) => {
  // What the requests should look like:
  // [{"id": "5d13750497534e2bf8fc260a", "position": "1"}, {"id": "5d1388435b698839547a2263", "position": 0}]

  const updateDocs = new Array();

  for (const doc of req.body) {
    let dId = doc.id;
    let dPos = doc.position;

    if (dId === undefined || dPos === undefined || !ObjectId.isValid(dId)) {
      return res.status(400).json({
        message:
          "Please specify a valid MongoDB Object-ID and the new position of the item - for each item in the document."
      });
    }

    updateDocs.push(doc);
  }

  var numberOfExistingItems = 0;

  for (const doc of updateDocs) {
    try {
      await getItemWithId(doc.id); // check if the item exists
      numberOfExistingItems++;
    } catch (error) {
      return res.status(error).json({
        message:
          error === 404
            ? "404. At least one of the specified documents does not exist. Request has not been processed!"
            : "An unexpected error occured."
      });
    } finally {
      if (numberOfExistingItems == updateDocs.length) {
        var numberOfSuccess = 0;
        for (const doc of updateDocs) {
          try {
            await updateOrder(doc.id, doc.position); // update them
            numberOfSuccess++;
          } catch (error) {
            return res.status(error).json({ message: "An unexpected error occured." });
          } finally {
            if (numberOfSuccess == updateDocs.length) {
              return res.status(200).json({
                message: "Successfully patched the position of the specified items!"
              });
            }
          }
        }
      }
    }
  }
});

// Functions

function getAllItems() {
  return ChecklistItem.find()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getItemsOfSection(sid) {
  return ChecklistItem.find({ sectionId: sid })
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getItemCount(sid) {
  return ChecklistItem.countDocuments({ sectionId: sid })
    .then(count => {
      console.log(count);
      return Promise.resolve(count);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function createItem(citem) {
  return citem
    .save()
    .then(result => {
      console.log(result);
      return Promise.resolve(201);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function deleteItem(id) {
  return ChecklistItem.deleteOne({ _id: id })
    .then(result => {
      console.log(result);
      if (result.deletedCount > 0) {
        return Promise.resolve(200);
      } else {
        return Promise.reject(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function updateItem(id, itemTitle, sec) {
  return ChecklistItem.updateOne({ _id: id }, { $set: { title: itemTitle, sectionId: sec } })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        return Promise.resolve(200);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function updateItemImage(id, imageName) {
  return ChecklistItem.updateOne({ _id: id }, { $set: { imageId: imageName } })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        return Promise.resolve(200);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getItemWithId(id) {
  return ChecklistItem.findOne({ _id: id })
    .then(doc => {
      if (doc) {
        console.log(doc);
        return Promise.resolve(doc);
      } else {
        return Promise.reject(404);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(error === 404 ? error : 500);
    });
}

function updateOrder(docId, pos) {
  return ChecklistItem.updateOne({ _id: docId }, { $set: { position: pos } })
    .then(result => {
      console.log(result);
      if (result.n > 0) {
        return Promise.resolve(200);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

module.exports = router;
