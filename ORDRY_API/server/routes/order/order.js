const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Order = require("../../models/order"); // get the model

const tomorrow = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate() + 1
);

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

// Routes

const orderFoodRoute = require("./order-food");
const orderBeverageRoute = require("./order-beverages");
const orderMenuRoute = require("./order-menu");

router.use("/food", orderFoodRoute);
router.use("/beverages", orderBeverageRoute);
router.use("/menus", orderMenuRoute);

// Routes

router.get("/getUnpaid", async (req, res, next) => {
  try {
    const result = await getAllUnpaid();

    return res.status(200).json({ orders: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.get("/getOrderById/:orderId", async (req, res, next) => {
  const oid = req.params.orderId;

  if (!ObjectId.isValid(oid)) {
    return res.status(400).json({
      message: "Bad request. The order id must be a valid MongoDB Object-ID, specified in the url!"
    });
  }

  try {
    const result = await getOrderById(oid);

    res.status(200).json({ result: result });
  } catch (error) {
    if (error === 404) {
      return res.status(404).json({ message: "404. No order found with id!" });
    }
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.patch("/markOrderFinished", async (req, res, next) => {
  const oid = req.body.orderId;

  if (!ObjectId.isValid(oid)) {
    return res
      .status(400)
      .json({ message: "Bad request. The 'orderID' must be a valid MongoDB Object-ID!" });
  }

  try {
    await markOrderFinished(oid);

    return res.status(200).json({ message: "Successfully marked order as paid (finished)!" });
  } catch (error) {
    if (error === 404) {
      return res.status(404).json({ message: "No order found with the specified ID!" });
    }
    console.log(error);

    return res.status(500).json({ message: "An unexpected error occured!" });
  }
});

// Functions

// Get

function getAllUnpaid() {
  return Order.find({
    finished: false,
    timestamp: {
      $gte: today,
      $lt: tomorrow
    }
  })
    .then(result => {
      if (result) return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function getOrderById(id) {
  return Order.find({
    _id: id
  })
    .then(result => {
      if (result[0]) return Promise.resolve(result);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

// Patch

function markOrderFinished(oid) {
  return Order.updateOne(
    { _id: oid },
    {
      $set: {
        finished: true
      }
    }
  )
    .then(result => {
      console.log(result);
      if (result.n > 0) return Promise.resolve(200);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

module.exports = router;
