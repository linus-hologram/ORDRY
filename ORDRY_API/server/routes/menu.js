const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Menu = require("../models/menu"); // get the model

// Router

router.get("/getMenuById/:id", async (req, res, next) => {
  const menuId = req.params.id;

  if (
    menuId === undefined ||
    typeof menuId !== "string" ||
    menuId == "" ||
    !ObjectId.isValid(menuId)
  ) {
    return res
      .status(400)
      .json({ message: "Menu id must be a valid MongoDB Object-ID, specified in the url!" });
  }

  try {
    const result = await getMenuWithId(menuId);

    res
      .status(result == 404 ? result : 200)
      .send({ message: result === 404 ? "404. No matching documents found!" : result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/addMenu", async (req, res, next) => {
  // what the request should look like:
  // {"name": "Schlemmer Menü", "available": true, "food": [{"name": "Salat", "price": 1.5}, {"name": "Schnitzel", "price": 4.5}, {"name": "Kuchen", "price": 1.5}]}
  const name = req.body.name;
  const available = req.body.available;
  const food = req.body.food;

  if (
    typeof name !== "string" ||
    name == "" ||
    typeof available !== "boolean" ||
    !Array.isArray(food)
  ) {
    return res.status(400).json({
      message:
        "Bad request! The 'name' of the menu has to be a non-empty string, the 'available' field must be a boolean and the 'food' field should be an array with subdocuments!"
    });
  }

  if (food.length < 2) {
    return res
      .status(400)
      .json({ message: "Bad request! The 'food' array should contain at least two elements!" });
  }

  for (const item of food) {
    if (typeof item.name !== "string" || item.name == "" || typeof item.price !== "number") {
      return res.status(400).json({
        message:
          "Bad request! Each item of the 'food' array should have a 'name' field of type non-empty string and a 'price' field of type number!"
      });
    }

    item._id = ObjectId(); // add a MongoDB Object ID to each food-item
  }

  const menu = new Menu({
    _id: ObjectId(),
    name: name,
    available: available,
    food: food
  });

  try {
    const result = await createMenu(menu);

    res.status(result).json({ message: "Successfully created new menu!", menu: menu });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.patch("/updateMenu", async (req, res, next) => {
  // what the request should look like:
  // {"id": "5d18a045be02ef0b00b22375", "name": "Mittags Menü", "available": true, "food": [{"name": "Suppe", "price": 2}, {"name": "Spaghetti Bolognese", "price": 5}, {"name": "Pudding", "price": 1.2}]}
  const id = req.body.id;
  const name = req.body.name;
  const available = req.body.available;
  const food = req.body.food;

  if (
    typeof name !== "string" ||
    name == "" ||
    typeof available !== "boolean" ||
    !Array.isArray(food) ||
    !ObjectId.isValid(id)
  ) {
    return res.status(400).json({
      message:
        "Bad request! The 'id' of the menu must be a valid MongoDB Object-ID, 'name' has to be a non-empty string, the 'available' field must be a boolean and the 'food' field should be an array with subdocuments!"
    });
  }

  if (food.length < 2) {
    return res
      .status(400)
      .json({ message: "Bad request! The 'food' array should contain at least two elements!" });
  }

  for (const item of food) {
    if (typeof item.name !== "string" || item.name == "" || typeof item.price !== "number") {
      return res.status(400).json({
        message:
          "Bad request! Each item of the 'food' array should have a 'name' field of type non-empty string and a 'price' field of type number!"
      });
    }

    if (!ObjectId.isValid(item._id)) {
      item._id = ObjectId(); // add a MongoDB Object ID to each food-item
    }
  }

  try {
    const result = await updateMenu(id, name, available, food);
    res
      .status(result === 404 ? 404 : 200)
      .json(
        result === 404
          ? { message: "404. Menu not found by ID." }
          : { message: "Successfully updated menu", menu: result }
      );
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

router.patch("/updateAvailability", async (req, res, next) => {
  const id = req.body.id;
  const available = req.body.available;

  if (typeof available !== "boolean" || !ObjectId.isValid(id)) {
    return res.status(400).json({
      message:
        "The id must be a valid MongoDB Object-ID! The 'available' field has to be a boolean!"
    });
  }

  try {
    const result = await updateMenuAvailability(id, available);
    res.status(result).json({
      message:
        result === 404 ? "404. Menu not found by ID." : "Sucessfully updated menu availability!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

router.delete("/deleteMenu", async (req, res, next) => {
  const id = req.body.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Bad request. Please specify a valid MongoDB Object-ID in the request body!"
    });
  }

  try {
    const result = await deleteMenu(id);

    res.status(result).json({
      message:
        result === 404 ? "404. No matching Menu ID found!" : "Menu has been succesfully deleted!"
    });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured." });
  }
});

// Functions

function getMenuWithId(id) {
  return Menu.find({ _id: id })
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

function createMenu(menu) {
  return menu
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

function updateMenu(id, name, available, food) {
  return Menu.findOne({ _id: id })
    .then(result => {
      console.log(result);

      if (result) {
        result.name = name;
        result.available = available;
        result.food = food;

        result.save();

        return Promise.resolve(result);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function updateMenuAvailability(id, available) {
  return Menu.updateOne(
    { _id: id },
    {
      $set: {
        available: available
      }
    }
  )
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

function deleteMenu(id) {
  return Menu.deleteOne({ _id: id })
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
