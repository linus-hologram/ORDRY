const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const OrderFood = require("../../models/order-food");
const Order = require("../../models/order");
const io = require("../../socket");

const tomorrow = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate() + 1
);

const today = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
);

// Routes

router.get("/getFoodForOrder/:orderId", async (req, res, next) => {
  const orderId = req.params.orderId;

  if (!ObjectId.isValid(orderId)) {
    return res
      .status(400)
      .json({
        message:
          "Order id must be a valid MongoDB Object-ID, specified in the url!"
      });
  }

  try {
    const result = await getFoodForOrder(orderId);
    console.log(result);
    res.status(200).json({ food: result });
  } catch (error) {
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.get("/getOpenFood", async (req, res, next) => {
  try {
    const result = await getUnpreparedFood();

    return res.status(200).json({ openFood: result });
  } catch (error) {
    return res.status(error).json({ message: "An unexpected error occured." });
  }
});

router.get("/getAllPrepared", async (req, res, next) => {
  // gets all food-orders that are prepared but not yet finished
  try {
    const result = await getPreparedFood();

    const orderNames = await Promise.all(
      result.map(async (f, i) => {
        const order = await getOrderById(f.orderId);

        return {
          foodId: f.foodId,
          foodOrderId: f._id,
          preparedAmount: f.preparedAmount,
          order: order,
          preparedAt: f.preparedAt
        };
      })
    );

    res.status(200).json({ result: orderNames });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({ message: "404. An order could not be found by its id.!" });
    }
    res.status(error).json({ message: "An unexpected error occured." }); // send back as json
  }
});

router.post("/createFood", async (req, res, next) => {
  const oid = req.body.orderId;
  const fid = req.body.fid;
  const amount = req.body.amount;

  if (
    !ObjectId.isValid(oid) ||
    !ObjectId.isValid(fid) ||
    typeof amount !== "number"
  ) {
    return res
      .status(400)
      .json({
        message:
          "Bad request. 'orderId' and 'fid' must be valid MongoDB Object-IDs. 'amount' must be a number!"
      });
  }

  try {
    const foodObject = OrderFood({
      orderId: oid,
      amount: amount,
      foodId: fid
    });

    await createOrderFood(foodObject);
    res.status(201).json({ message: "Successfully added food to order" });
  } catch (error) {
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.patch("/updateAmount", async (req, res, next) => {
  const fid = req.body.foodOrderId;
  const amount = req.body.amount;

  if (!ObjectId.isValid(fid) || typeof amount !== "number") {
    return res
      .status(400)
      .json({
        message:
          "Bad request. The foodOrderId must be specified and should be valid MongoDB Object-ID. The amount must be a number!"
      });
  }

  try {
    await updateFoodAmount(fid, amount);

    return res
      .status(200)
      .json({ message: "Successfully updated the amount!" });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({
          message: "No food-order found with specified orderID or foodId!"
        });
    }
    return res.status(error).json({ message: "An unexpected error occured." });
  }
});

router.patch("/increaseFinished", async (req, res, next) => {
  // increases the finished field by one
  const fid = req.body.foodOrderId; // the unique foodOrder Id

  if (!ObjectId.isValid(fid)) {
    return res
      .status(400)
      .json({
        message:
          "Bad request. The foodOrderId must be specified and should be a valid MongoDB Object-ID!"
      });
  }

  try {
    await increaseFoodFinished(fid);
    const foodOrder = await getFoodOrderById(fid);

    io.getIO().emit("food-order-finished-changed", {
      fid: fid,
      finished: foodOrder.finished,
      orderId: foodOrder.orderId
    });

    return res
      .status(200)
      .json({
        message:
          "Successfully increased the 'finished' field of the specified food!"
      });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({
          message:
            "No food-order found with specified foodOrderId that could be updated!"
        });
    }
    return res.status(error).json({ message: "An unexpected error occured." });
  }
});

router.patch("/decreaseFinished", async (req, res, next) => {
  // increases the finished field by one
  const fid = req.body.foodOrderId; // the unique foodOrder Id

  if (!ObjectId.isValid(fid)) {
    return res
      .status(400)
      .json({
        message:
          "Bad request. The foodOrderId must be specified and should be a valid MongoDB Object-ID!"
      });
  }

  try {
    await decreaseFoodFinished(fid);
    const foodOrder = await getFoodOrderById(fid);

    io.getIO().emit("food-order-finished-changed", {
      fid: fid,
      finished: foodOrder.finished,
      orderId: foodOrder.orderId
    });

    return res
      .status(200)
      .json({
        message:
          "Successfully decreased the 'finished' field of the specified foodOrder!",
        foodOrderId: fid
      });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({
          message:
            "No food-order found with specified foodOrderId that could be updated!"
        });
    }
    return res.status(error).json({ message: "An unexpected error occured." });
  }
});

router.patch("/increasePrepared", async (req, res, next) => {
  // this request automatically increases the prepared field of the correct order
  // - the order that has been ordered the longest time ago.
  const fid = req.body.foodId;

  if (!ObjectId.isValid(fid)) {
    return res
      .status(400)
      .json({
        message: "The specified 'foodId' must be a valid MongoDB Object-ID"
      });
  }

  try {
    const oldestOrder = await getOldestFoodOrder(fid); // get the oldest food order

    await increasePrepared(oldestOrder._id); // increase the 'prepared' field by 1

    res
      .status(200)
      .json({
        message: "Successfully increased the 'prepared' field by one!",
        foodOrderId: oldestOrder._id
      });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({ message: "No food-order found that could be updated!" });
    }
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.patch("/decreasePrepared", async (req, res, next) => {
  const foodOrderId = req.body.foodOrderId;

  if (!ObjectId.isValid(foodOrderId)) {
    return res
      .status(400)
      .json({
        message: "The specified 'foodOrderId' must be a valid MongoDB Object-ID"
      });
  }

  try {
    await decreasePrepared(foodOrderId);
    res
      .status(200)
      .json({
        message: "Successfully decreased the 'prepared' field by one!",
        foodOrderId: foodOrderId
      });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({ message: "No food-order found that could be updated!" });
    }
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.delete("/deleteOneFood", async (req, res, next) => {
  const fid = req.body.foodOrderId;

  if (!ObjectId.isValid(fid)) {
    return res
      .status(400)
      .json({
        message:
          "Bad request. The foodOrderId must be specified and should be a valid MongoDB Object-ID."
      });
  }

  try {
    const result = await deleteOrderFood(fid);

    return res
      .status(200)
      .json({ message: "Successfully deleted the food-order!" });
  } catch (error) {
    if (error === 404) {
      return res
        .status(404)
        .json({ message: "No food-order found with specified foodOrderId!" });
    }
    return res.status(error).json({ message: "An unexpected error occured." });
  }
});

// Functions

// Get

function getFoodOrderById(id) {
  return OrderFood.findOne({ _id: id })
    .then(result => {
      return Promise.resolve(result);
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

function getFoodForOrder(id) {
  return OrderFood.find({
    orderId: id
  })
    .then(doc => {
      if (doc) {
        console.log(doc);
        return Promise.resolve(doc);
      }
    })
    .catch(error => {
      console.log("Error: ", error);
      return Promise.reject(500);
    });
}

function getUnpreparedFood() {
  return OrderFood.aggregate([
    {
      $match: {
        $expr: { $lt: ["$prepared", "$amount"] },
        timestamp: {
          $gte: today,
          $lt: tomorrow
        }
      }
    },
    {
      $group: {
        _id: "$foodId",
        totalAmount: { $sum: "$amount" },
        totalPrepared: { $sum: "$prepared" }
      }
    },
    {
      $addFields: {
        open: { $subtract: ["$totalAmount", "$totalPrepared"] }
      }
    }
  ])
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
    });
}

function getPreparedFood() {
  return OrderFood.aggregate([
    {
      $match: {
        $expr: { $lt: ["$finished", "$prepared"] },
        timestamp: {
          $gte: today,
          $lt: tomorrow
        }
      }
    },
    { $sort: { preparedAt: 1 } },
    {
      $addFields: {
        preparedAmount: { $subtract: ["$prepared", "$finished"] }
      }
    }
  ])
    .then(result => {
      console.log(result);
      return Promise.resolve(result);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(500);
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

function getOldestFoodOrder(fid) {
  return OrderFood.find({
    foodId: fid,
    $expr: { $lt: ["$prepared", "$amount"] },
    timestamp: { $gte: today, $lt: tomorrow }
  })
    .sort({ timestamp: 1 })
    .then(result => {
      if (result[0]) return Promise.resolve(result[0]);
      return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

// Post

function createOrderFood(orderFood) {
  // avoid that the added product will show up on the kitchen screen - mark it as "done"
  orderFood.prepared = orderFood.amount;
  orderFood.finished = orderFood.amount;

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

// Patch

function updateFoodAmount(fid, amount) {
  return OrderFood.updateOne(
    { _id: fid },
    {
      $set: {
        amount: amount
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

function increaseFoodFinished(fid) {
  return OrderFood.findOneAndUpdate(
    {
      _id: fid,
      $expr: { $lt: ["$finished", "$prepared"] },
      timestamp: { $gte: today, $lt: tomorrow }
    },
    {
      $inc: { finished: 1 }
    }
  )
    .then(result => {
      if (result) return Promise.resolve(200);
      return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function decreaseFoodFinished(fid) {
  return OrderFood.findOneAndUpdate(
    {
      _id: fid,
      $expr: { $lte: ["$finished", "$prepared"] },
      $expr: { $gt: ["$finished", 0] },
      timestamp: { $gte: today, $lt: tomorrow }
    },
    {
      $inc: { finished: -1 }
    }
  )
    .then(result => {
      if (result) return Promise.resolve(200);
      return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function increasePrepared(foodOrderId) {
  console.log(foodOrderId);
  return OrderFood.findOneAndUpdate(
    {
      _id: foodOrderId,
      $expr: { $lt: ["$prepared", "$amount"] },
      timestamp: { $gte: today, $lt: tomorrow }
    },
    {
      $inc: { prepared: 1 },
      preparedAt: Date()
    }
  )
    .then(result => {
      if (result) return Promise.resolve(200);
      return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

function decreasePrepared(foodOrderId) {
  console.log(foodOrderId);
  return OrderFood.findOneAndUpdate(
    {
      _id: foodOrderId,
      $expr: { $lte: ["$prepared", "$amount"] },
      $expr: { $gt: ["$prepared", 0] },
      $expr: { $gt: ["$prepared", "$finished"] },
      timestamp: { $gte: today, $lt: tomorrow }
    },
    {
      $inc: { prepared: -1 }
    }
  )
    .then(result => {
      if (result) return Promise.resolve(200);
      return Promise.reject(404);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

// Delete

function deleteOrderFood(fid) {
  return OrderFood.deleteOne({ _id: fid })
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
