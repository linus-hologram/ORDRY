const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Food = require("../models/food"); // get the model

// Routes

router.get("/getFoodById/:id", async (req, res, next) => {
  const foodId = req.params.id;

  if (
    foodId === undefined ||
    typeof foodId !== "string" ||
    foodId == "" ||
    !ObjectId.isValid(foodId)
  ) {
    return res
      .status(400)
      .json({ message: "Food id must be a valid MongoDB Object-ID, specified in the url!" });
  }

  try {
    const result = await getFoodWithId(foodId);

    res
      .status(result == 404 ? result : 200)
      .send({ message: result === 404 ? "404. No matching documents found!" : result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/addFood", async (req, res, next) => {
  const name = req.body.name;
  const available = req.body.available;
  const price = req.body.price;

  console.log(req.body);

  if (
    typeof name !== "string" ||
    name == "" ||
    typeof price !== "number" ||
    typeof available !== "boolean"
  ) {
    return res.status(400).json({
      message:
        "Bad request. In order to create a new product, a request should include the following fields: 'name' -> String -> not empty, 'available' -> Boolean and 'price' -> Number !"
    });
  }

  const food = new Food({
    _id: ObjectId(),
    name: name,
    available: available,
    price: price
  });

  try {
    const result = await createFood(food);

    res.status(result).json({ message: "Successfully created new food!", food: food });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.patch("/updateFood", async (req, res, next) => {
  // {"id": "123", "name": "Schnitzel mit Chicken Nuggets", "available": false, "price": 7.5}
  const name = req.body.name;
  const price = req.body.price;
  const available = req.body.available;
  const foodId = req.body.id;

  if (
    typeof name !== "string" ||
    name == "" ||
    typeof price !== "number" ||
    typeof available !== "boolean" ||
    !ObjectId.isValid(foodId)
  ) {
    return res.status(400).json({
      message:
        "Bad request. In order to update a product please specify all fields of a product: 'id' -> String -> Valid MongoDB Object-ID, 'name' -> String -> not empty, 'available' -> Boolean and 'price' -> Number !"
    });
  }

  try {
    const result = await updateFood(foodId, name, price, available);

    res.status(result).json({
      message: result === 404 ? "404. Food not found by ID." : "Sucessfully updated food!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

router.patch("/updateAvailability", async (req, res, next) => {
  const foodId = req.body.id;
  const available = req.body.available;

  if (!ObjectId.isValid(foodId) || typeof available !== "boolean") {
    return res.status(400).json({
      message:
        "Please specify a valid MongoDB Object-ID as well as a boolean value for 'available'!"
    });
  }

  try {
    const result = await updateFoodAvailability(foodId, available);

    res.status(result).json({
      message:
        result === 404 ? "404. Food not found by ID." : "Sucessfully updated food availability!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

router.delete("/deleteFood", async (req, res, next) => {
  const id = req.body.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Bad request. Please specify a valid MongoDB Object-ID in the request body!"
    });
  }

  try {
    const result = await deleteFood(id);

    res.status(result).json({
      message:
        result === 404 ? "404. No matching Food ID found!" : "Food has been succesfully deleted!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

// Functions

function getFoodWithId(id) {
  return Food.find({ _id: id })
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

function createFood(food) {
  return food
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

function updateFood(id, name, price, available) {
  return Food.updateOne({ _id: id }, { $set: { name: name, available: available, price: price } })
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

function updateFoodAvailability(id, available) {
  return Food.updateOne({ _id: id }, { $set: { available: available } })
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

function deleteFood(id) {
  return Food.deleteOne({ _id: id })
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
