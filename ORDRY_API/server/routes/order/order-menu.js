const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Order = require('../../models/order')
const OrderMenu = require('../../models/order-menu')
const io = require("../../socket")

const tomorrow = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

// Router
router.get("/getMenusForOrder/:orderId", async (req, res, next) => {
    const orderId = req.params.orderId

    if (orderId === undefined || typeof orderId !== "string" || orderId == "" || !ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Order id must be a valid MongoDB Object-ID, specified in the url!" })
    }

    try {
        const result = await getMenusForOrder(orderId)

        res.status(200).json({ menus: result })
    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }

})

router.get("/getAllUnprepared", async (req, res, next) => {
    try {
        const result = await getUnpreparedMenus()

        res.status(200).json({ result: result })
    } catch (error) {
        return res.status(500).json(error)
    }
})

router.get("/getAllPrepared", async (req, res, next) => {
    try {
        const result = await getPreparedMenuItems()

        const output = await Promise.all(result.map(async (m, i) => {
            const order = await getOrderById(m.orderId)

            m.forename = order.forename
            m.surname = order.surname
            return m
        }))

        res.status(200).send(output)
    } catch (error) {
        return res.status(500).json({ message: "An unexpected error occured." })
    }
})

router.patch("/markMenuPrepared", async (req, res, next) => { // this request automatically increases the prepared field of the correct order
    // - the order that has been ordered the longest time ago.
    const mid = req.body.menuId
    const itemId = req.body.itemId

    if (!ObjectId.isValid(mid), !ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "The specified 'mid' and 'itemId' must be a valid MongoDB Object-ID" })
    }

    try {

        const oldestOrder = await getOldestUnpreparedMenuOrder(mid, itemId) // get the oldest food order

        await markMenuPrepared(oldestOrder._id, itemId)

        res.status(200).json({ message: "Successfully marked the menu-item as prepared!", menuOrderId: oldestOrder._id })

    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "No menu-order found that could be updated!" })
        }
        res.status(500).json({ message: "An unexpected error occured!" })
    }
})

router.patch("/undoMenuPreparedMark", async (req, res, next) => {
    const menuOrderId = req.body.menuOrderId
    const itemId = req.body.itemId

    if (!ObjectId.isValid(menuOrderId) || !ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "The specified menuOrderId & itemId must be valid MongoDB Object-IDs" })
    }

    try {
        await undoMarkMenuPrepared(menuOrderId, itemId)

        res.status(200).json({ message: "Successfully marked the menu-item as unprepared!" })
    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "No menu-order found that could be updated!" })
        }
        res.status(500).json({ message: "An unexpected error occured!" })
    }
})

router.patch("/markMenuFinished", async (req, res, next) => {
    const mid = req.body.menuOrderId
    const itemId = req.body.itemId

    if (!ObjectId.isValid(mid) || !ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "Bad request. The menuOrderId and itemId must be specified and should be valid MongoDB Object-IDs." })
    }

    try {

        await markMenuFinished(mid, itemId)
        const currentMenuOrder = await getOrderMenuById(mid)

        const finishedItems = currentMenuOrder.items.filter(i => {
            return i.finished === true
        })

        if (finishedItems.length === currentMenuOrder.items.length) { // all items are finished
            await setMenuOrderFinished(mid, true) // set the menu order to finished then
        }
        io.getIO().emit("menu-order-finished-changed", {menuOrderId: mid, orderId: currentMenuOrder.orderId, items: currentMenuOrder.items, finished: (finishedItems.length === currentMenuOrder.items.length)})

        return res.status(200).json({ message: "Successfully updated the 'finished' field of the specified order-menu!" })

    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "No menu-order found with the specified menuOrderId or itemId!" })
        }
        return res.status(error).json({ message: "An unexpected error occured." })
    }
})

router.patch("/undoMarkMenuFinished", async (req, res, next) => {
    const menuOrderId = req.body.menuOrderId
    const itemId = req.body.itemId

    if (!ObjectId.isValid(menuOrderId) || !ObjectId.isValid(itemId)) {
        return res.status(400).json({ message: "The specified menuOrderId & itemId must be valid MongoDB Object-IDs" })
    }

    try {

        await undoMarkMenuFinished(menuOrderId, itemId)
        await setMenuOrderFinished(menuOrderId, false) // we just marked an item as unfinished, so we have to change the finished val of the menuOrder
        const currentMenuOrder = await getOrderMenuById(menuOrderId)
        io.getIO().emit("menu-order-finished-changed", {menuOrderId: menuOrderId, orderId: currentMenuOrder.orderId, items: currentMenuOrder.items, finished: false})
        return res.status(200).json({ message: "Successfully updated the 'finished' field of the specified order-menu!" })

    } catch (error) {
        console.error(error)
    }
})

router.delete("/deleteOneMenu", async (req, res, next) => {
    const mid = req.body.menuOrderId

    if (!ObjectId.isValid(mid)) {
        return res.status(400).json({ message: "Bad request. The menuOrderId must be specified and should be a valid MongoDB Object-ID." })
    }

    try {
        const result = await deleteOrderMenu(mid)

        return res.status(200).json({ message: "Successfully deleted the menu-order!" })

    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "No menu-order found with specified menuOrderId!" })
        }
        return res.status(error).json({ message: "An unexpected error occured." })
    }
})

router.post("/addMenu", async (req, res, next) => {
    const orderId = req.body.orderId
    const menuId = req.body.menuId
    const menuItems = req.body.items

    try {

        const orderMenu = OrderMenu({
            menuId: menuId,
            items: menuItems,
            orderId: orderId,
            finished: true
        })

        await validateMenu(orderMenu)
        const result = await createOrderMenu(orderMenu)
        res.status(result).json({ message: "Successfully added menu to an existing order!" })
    } catch (error) {
        if (error === 400)
            return res.status(400).json({ message: "Bad request. Please refer to the API docs on how to perform a valid request." })
        return res.status(500).json({ message: "An unexpected error occured!" })
    }
})

// Functions

// Get

function getMenusForOrder(id) {
    return OrderMenu.find({
        orderId: id
    }).then(doc => {
        if (doc) {
            console.log(doc)
            return Promise.resolve(doc)
        }
    }).catch(error => {
        console.log("Error: ", error)
        return Promise.reject(500)
    })
}

function getPreparedMenuItems() {

    return OrderMenu.aggregate([
        { $unwind: "$items" },
        { $project: { "items.prepared": 1, "items.finished": 1, "items.itemId": 1, "items.timestamp": 1, "menuId": 1, "orderId": 1 } },
        {
            $match: {
                "items.prepared": true,
                "items.finished": false,
                "items.timestamp": {
                    $gte: today,
                    $lt: tomorrow
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                itemId: { $addToSet: "$items.itemId" },
                menuId: { $first: "$menuId" },
                orderId: { $first: "$orderId" },
                timestamp: { $min: "$items.timestamp" }
            }
        }

    ]).then(result => {
        console.log(result)
        if (result)
            return Promise.resolve(result)
        return Promise.reject("The aggregation did not return any result!")
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

function getUnpreparedMenus() {
    return OrderMenu.aggregate([
        { $unwind: "$items" },
        { $project: { "items.prepared": 1, "items.itemId": 1, "items.timestamp": 1, "menuId": 1 } },
        {
            $match: {
                "items.prepared": false,
                "items.timestamp": {
                    $gte: today,
                    $lt: tomorrow
                }
            }
        },
        {
            $group: {
                _id: { menuId: '$menuId', itemId: '$items.itemId' },
                count: { $sum: 1 }
            }
        }
    ]).then(result => {
        console.log(result)
        if (result)
            return Promise.resolve(result)
        return Promise.reject("There was no result at the end of the aggregation!")
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

function getOldestUnpreparedMenuOrder(mid, itemId) {

    return OrderMenu.find({
        menuId: mid,
        items: {
            $elemMatch: {
                prepared: false,
                itemId: itemId
            }
        },
        timestamp: { $gte: today, $lt: tomorrow }
    }).sort({ timestamp: 1 }).then((result) => {
        console.log(result)
        if (result[0])
            return Promise.resolve(result[0])
        return Promise.reject(404)
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

function getOrderById(oid) {
    return Order.findById(oid).then(result => {
        if (result)
            return Promise.resolve(result)
        return Promise.reject(404)
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

function getOrderMenuById(mid) {
    return OrderMenu.findById(mid).then(result => {
        if (result)
            return Promise.resolve(result)
        return Promise.reject(404)
    })
}

// Post

function createOrderMenu(orderMenu) {

    return orderMenu.save().then(result => {
        console.log(result);
        return Promise.resolve(200)
    })
        .catch((error) => {
            console.log(error);
            return Promise.reject(500)
        })
}

// Patch

function markMenuFinished(mid, itemId) {
    return OrderMenu.updateOne({ "_id": mid, "items.itemId": itemId },
        {
            "$set": {
                "items.$.finished": true
            }
        }).then(result => {
            console.log(result)
            if (result.n > 0)
                return Promise.resolve(200)
            else
                return Promise.reject(404)
        }).catch(error => {
            console.log(error)
            return Promise.reject(error)
        })
}

function undoMarkMenuFinished(menuOrderId, itemId) {
    return OrderMenu.updateOne({ "_id": menuOrderId, "items.itemId": itemId },
        {
            "$set": {
                "items.$.finished": false
            }
        }).then(result => {
            console.log(result)
            if (result.n > 0)
                return Promise.resolve(200)
            else
                return Promise.reject(404)
        }).catch(error => {
            console.log(error)
            return Promise.reject(error)
        })
}

function markMenuPrepared(menuOrderId, itemId) {

    return OrderMenu.findOneAndUpdate({
        _id: menuOrderId,
        items: {
            $elemMatch: {
                prepared: false,
                itemId: itemId
            }
        },
        timestamp: { $gte: today, $lt: tomorrow }
    }, {
        "$set": {
            "items.$.prepared": true
        }
    }).then((result) => {
        if (result)
            return Promise.resolve(200)
        return Promise.reject(404)
    }).catch((error) => {
        console.log(error)
        return Promise.reject(error)
    })
}

function undoMarkMenuPrepared(menuOrderId, itemId) {

    return OrderMenu.findOneAndUpdate({
        _id: menuOrderId,
        finished: false,
        items: {
            $elemMatch: {
                prepared: true,
                finished: false,
                itemId: itemId
            }
        },
        timestamp: { $gte: today, $lt: tomorrow }
    }, {
        "$set": {
            "items.$.prepared": false
        }
    }).then((result) => {
        if (result)
            return Promise.resolve(200)
        return Promise.reject(404)
    }).catch((error) => {
        console.log(error)
        return Promise.reject(error)
    })
}

function setMenuOrderFinished(mid, value) {
    return OrderMenu.updateOne({ "_id": mid }, {
        "$set": {
            "finished": value
        }
    }).then(result => {
        console.log(result)
        if (result.n > 0)
            return Promise.resolve(200)
        else
            return Promise.reject(404)
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

// Delete

function deleteOrderMenu(mid) {
    return OrderMenu.deleteOne({ _id: mid }).then(result => {
        console.log(result)
        if (result.n > 0)
            return Promise.resolve(200)
        else
            return Promise.reject(404)
    }).catch(error => {
        console.log(error)
        return Promise.reject(error)
    })
}

// validation

async function validateMenu(orderMenu) {

    try {
        await orderMenu.validate()

        return Promise.resolve()

    } catch (error) {
        console.log(error)
        return Promise.reject(400)
    }
}

module.exports = router