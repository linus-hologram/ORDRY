const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Beverage = require("../models/beverage"); // get the model

const availableCategorys = ["kalt", "warm", "alkoholisch"];
// Routes

router.get("/getBeverageById/:id", async (req, res, next) => {
  const beverageId = req.params.id;

  if (
    beverageId === undefined ||
    typeof beverageId !== "string" ||
    beverageId == "" ||
    !ObjectId.isValid(beverageId)
  ) {
    return res
      .status(400)
      .json({ message: "Beverage id must be a valid MongoDB Object-ID, specified in the url!" });
  }

  try {
    const result = await getBeverageWithId(beverageId);

    res
      .status(result == 404 ? result : 200)
      .send({ message: result === 404 ? "404. No matching documents found!" : result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/addBeverage", async (req, res, next) => {
  const name = req.body.name;
  const category = req.body.category;
  const sizes = req.body.sizes;

  if (!availableCategorys.includes(category)) {
    return res.status(400).json({
      message:
        "Bad request. The category of a beverage has to be specified and must be either 'kalt', 'warm' or 'alkoholisch'!"
    });
  }

  if (typeof name !== "string" || name == "" || !Array.isArray(sizes)) {
    return res.status(400).json({
      message:
        "Bad request. The name of a beverage has to be specified and must be a non-empty string! Each request must feature a 'sizes' array."
    });
  }

  sizes.forEach(size => {
    size._id = new ObjectId();
  });

  const beverage = new Beverage({
    _id: new ObjectId(),
    name: name,
    category: category,
    sizes: sizes
  });

  try {
    await beverage.validate();
    const result = await createBeverage(beverage);

    res.status(result).json({ message: "Successfully created new beverage!", beverage: beverage });
  } catch (error) {
    if (typeof error === "number") {
      console.log(error);
      res.status(error).json({ message: "An unexpected error occured." }); // send back as json
    }
    res
      .status(400)
      .json({ message: "Bad request. Please check your sizes array and refer to the API docs." });
  }
});

router.patch("/updateBeverage", async (req, res, next) => {
  // {"name": "Fanta", "category": "kalt", "id": "5d14c064f4f1fe330c5f43e6", "sizes": []}
  const name = req.body.name;
  const category = req.body.category;
  const beverageId = req.body.id;
  const sizes = req.body.sizes;

  if (
    name == "" ||
    !availableCategorys.includes(category) ||
    beverageId == "" ||
    !ObjectId.isValid(beverageId) ||
    !Array.isArray(sizes)
  ) {
    return res.status(400).json({
      message:
        "Bad request. The category of a beverage has to be specified and must be either 'kalt', 'warm' or 'alkoholisch'! Besides, the id field has to be a valid MongoDB ObjectID and the name of the beverage has to be set to a non-empty string. Also, a value sizes must be specified and should be a valid Array."
    });
  }

  sizes.forEach(size => {
    if (!size._id) {
      // necessarry as existing sizes would be overwritten without this check
      size._id = new ObjectId();
    }
  });

  const beverage = new Beverage({
    // object only used for validation
    _id: new ObjectId(),
    name: name,
    category: category,
    sizes: sizes
  });

  try {
    await beverage.validate();

    const result = await updateBeverage(beverageId, name, category, sizes);

    res.status(result).json({
      message:
        result === 404 ? "404. Beverage not found by ID." : "Sucessfully updated the beverage!"
    });
  } catch (error) {
    if (typeof error === "number") {
      console.log(error);
      res.status(error).json({ message: "An unexpected error occured." }); // send back as json
    }
    res
      .status(400)
      .json({ message: "Bad request. Please check your sizes array and refer to the API docs." });
  }
});

router.delete("/deleteBeverage", async (req, res, next) => {
  const id = req.body.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Bad request. Please specify a valid MongoDB Object-ID in the request body!"
    });
  }

  try {
    const result = await deleteBeverage(id);

    res.status(result).json({
      message:
        result === 404
          ? "404. No matching Beverage ID found!"
          : "Beverage has been succesfully deleted!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

// Functions

function getBeverageWithId(id) {
  return Beverage.find({ _id: id })
    .then(doc => {
      if (doc[0]) {
        console.log(doc);
        return Promise.resolve(doc);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}

function createBeverage(beverage) {
  return beverage
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

function updateBeverage(id, name, category, sizes) {
  return Beverage.updateOne({ _id: id }, { $set: { name: name, category: category, sizes: sizes } })
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

function deleteBeverage(id) {
  return Beverage.deleteOne({ _id: id })
    .then(result => {
      console.log(result);
      if (result.deletedCount > 0) {
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
