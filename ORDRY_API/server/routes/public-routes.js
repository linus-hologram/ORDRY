const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Order = require("../models/order"); // get the model
const OrderFood = require("../models/order-food");
const OrderBeverage = require("../models/order-beverages");
const OrderMenu = require("../models/order-menu");
const io = require("../socket");

const Beverage = require("../models/beverage"); // get the model
const Food = require("../models/food"); // get the model
const Menu = require("../models/menu"); // get the model

const sessionManager = require("../session");

router.get("/isServiceActive", async (req, res, next) => {
  try {
    const serviceActive = await sessionManager.isServiceActive();

    return res.status(200).json({ active: serviceActive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.get("/getAllBeverages", async (req, res, next) => {
  try {
    const bvgs = await getAllBeverages();
    res.status(200).json(bvgs);
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllAvailableBeverages", async (req, res, next) => {
  try {
    const result = await getAllAvailableBeverages();

    res
      .status(result === 404 ? result : 200)
      .json(result === 404 ? { message: "No matching documents found!" } : { beverages: result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllAvailableBeverages/:category", async (req, res, next) => {
  const category = req.params.category;

  if (!["kalt", "warm", "alkoholisch"].includes(category)) {
    return res.status(400).json({
      message:
        "Bad request. Please specify the category at the end of the Url. The following categories are available: 'warm', 'kalt' or 'alkoholisch'"
    });
  }

  try {
    const result = await getAllAvailableOfCategory(category);

    res
      .status(result === 404 ? result : 200)
      .json(result === 404 ? { message: "No matching documents found!" } : { beverages: result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllFood", async (req, res, next) => {
  try {
    const food = await getAllFood();
    res.status(200).json(food);
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllAvailableFood", async (req, res, next) => {
  try {
    const result = await getAllAvailableFood();

    res
      .status(result === 404 ? result : 200)
      .json(result === 404 ? { message: "No matching documents found!" } : { food: result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllMenus", async (req, res, next) => {
  try {
    const menus = await getAllMenus();
    res.status(200).json(menus);
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getAllAvailableMenus", async (req, res, next) => {
  try {
    const result = await getAllAvailableMenus();

    res
      .status(result === 404 ? result : 200)
      .json(result === 404 ? { message: "No matching documents found!" } : { menus: result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/create-order", async (req, res, next) => {
  const forename = req.body.forename;
  const surname = req.body.surname;
  const food = req.body.food;
  const beverages = req.body.beverages;
  const menus = req.body.menus;

  if (
    typeof forename !== "string" ||
    typeof surname !== "string" ||
    !Array.isArray(food) ||
    !Array.isArray(beverages) ||
    !Array.isArray(menus) ||
    food.length + beverages.length + menus.length == 0
  ) {
    return res.status(400).json({
      message:
        "Bad request. In order to create an order, it is necessary to specify a 'food', 'beverages' and 'menus' array. At least one of the arrays must contain a corresponding item as the order would be empty otherwise. Furthermore, both 'forename' and 'surname' must be provided as a valid, non-empty string."
    });
  }

  const order = Order({
    forename: forename,
    surname: surname,
    beverages: beverages
  });

  try {
    const isServiceActive = await sessionManager.isServiceActive();
    if (isServiceActive == false) {
      console.log("Service inactive!");
      return res.status(503).json({ message: "The service is currently inactive!" });
    }

    await order.validate();

    await Promise.all(
      menus.map(async (m, i) => {
        await validateMenu(m);
      })
    );

    await Promise.all(
      food.map(async (f, i) => {
        await validateFood(f);
      })
    );

    await Promise.all(
      beverages.map(async (b, i) => {
        await validateBeverages(b);
      })
    );

    console.log("Passed the menu, food, order & beverage check!");

    const orderResult = await createOrder(order);

    const omResult = await Promise.all(
      menus.map(async (m, i) => {
        const menuObject = OrderMenu({
          menuId: m.menuId,
          items: m.items
        });

        const result = await createOrderMenu(menuObject, orderResult._id);
        return result;
      })
    );

    const ofResult = await Promise.all(
      food.map(async (f, i) => {
        const foodObject = OrderFood({
          foodId: f.foodId,
          amount: f.amount
        });

        const result = await createOrderFood(foodObject, orderResult._id);
        return result;
      })
    );

    const obResult = await Promise.all(
      beverages.map(async (b, i) => {
        const beverageObject = OrderBeverage({
          beverageId: b.beverageId,
          amount: b.amount,
          sizeId: b.sizeId
        });

        const result = await createOrderBeverage(beverageObject, orderResult._id);
        return result;
      })
    );

    console.log(ofResult, omResult, obResult);

    io.getIO().emit("order-placed", {
      order: orderResult,
      food: ofResult,
      menus: omResult,
      beverages: obResult
    });

    res.status(201).json({
      message: "Successfully created new order, order menu, order food and order beverages!",
      orderId: orderResult._id
    });
  } catch (error) {
    if (error === 500) {
      return res.status(500).json({ message: "An unexpected error occured!" });
    }

    return res.status(400).json({
      message: "Bad request. Please take a look at the correct request form in the API docs."
    });
  }
});

// Get

function getAllBeverages() {
  return Beverage.find()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllAvailableBeverages() {
  return Beverage.find({
    sizes: { $elemMatch: { available: true } }
  })
    .then(docs => {
      if (docs[0]) {
        console.log(docs);
        return Promise.resolve(docs);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllAvailableOfCategory(category) {
  return Beverage.find({
    category: category,
    sizes: { $elemMatch: { available: true } }
  })
    .then(docs => {
      if (docs[0]) {
        console.log(docs);
        return Promise.resolve(docs);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllFood() {
  return Food.find()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllAvailableFood() {
  return Food.find({
    available: true
  })
    .then(docs => {
      if (docs[0]) {
        console.log(docs);
        return Promise.resolve(docs);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllMenus() {
  return Menu.find()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getAllAvailableMenus() {
  return Menu.find({
    available: true
  })
    .then(docs => {
      if (docs[0]) {
        console.log(docs);
        return Promise.resolve(docs);
      } else {
        return Promise.resolve(404);
      }
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

// Create

function createOrder(order) {
  return order
    .save()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function createOrderFood(orderFood, orderId) {
  orderFood.orderId = orderId;

  return orderFood
    .save()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function createOrderMenu(orderMenu, orderId) {
  orderMenu.orderId = orderId;

  return orderMenu
    .save()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function createOrderBeverage(orderBeverage, orderId) {
  orderBeverage.orderId = orderId;

  return orderBeverage
    .save()
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

// Validation

async function validateMenu(m) {
  const orderMenu = OrderMenu({
    menuId: m.menuId,
    items: m.items,
    orderId: ObjectId()
  });

  try {
    await orderMenu.validate();

    return Promise.resolve();
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
}

async function validateFood(f) {
  const orderFood = OrderFood({
    foodId: f.foodId,
    amount: f.amount,
    orderId: ObjectId()
  });

  try {
    await orderFood.validate();

    return Promise.resolve();
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
}

async function validateBeverages(b) {
  const orderBeverage = OrderBeverage({
    beverageId: b.beverageId,
    amount: b.amount,
    sizeId: b.sizeId,
    orderId: ObjectId()
  });

  try {
    await orderBeverage.validate();

    return Promise.resolve();
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
}

module.exports = router;
