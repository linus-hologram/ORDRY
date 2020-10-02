const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const OrderBeverage = require('../../models/order-beverages')

const tomorrow = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

// Routes

router.get("/getBeverages/:orderId", async (req, res, next) => {
    const orderId = req.params.orderId

    if (orderId === undefined || typeof orderId !== "string" || orderId == "" || !ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Order id must be a valid MongoDB Object-ID, specified in the url!" })
    }

    try {
        const result = await getBeveragesForOrder(orderId)

        res.status(200).send({ beverages: result })
    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }
})

router.get("/getOrdersWithOpenBeverages/", async (req, res, next) => {

    try {

        const result = await getOrdersWithOpenBeverages()

        const outputIds = []
        result.forEach(doc => {
            outputIds.push(doc._id)
        })

        return res.status(200).send({ orders: outputIds })
    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }

})


router.post("/createBeverage", async (req, res, next) => {
    const bid = req.body.bid
    const sizeId = req.body.sizeId
    const oid = req.body.orderId
    const amount = req.body.amount

    if (!ObjectId.isValid(bid) || !ObjectId.isValid(sizeId) || !ObjectId.isValid(oid) || typeof amount !== "number") {
        return res.status(400).json({ message: "Bad request. 'bid', 'sizeId', 'orderId' must be valid MongoDB Object-IDs. 'amount' must be a number!" })
    }

    try {
        const beverageObject = OrderBeverage({
            beverageId: bid,
            amount: amount,
            sizeId: sizeId,
            orderId: oid,
            finished: true
        })

        await createOrderBeverage(beverageObject)
        res.status(201).json({ message: "Successfully added beverage to order" })

    } catch (error) {
        res.status(500).json({ message: "An unexpected error occured!" })
    }

})

router.patch("/updateOrderBeveragesStatus", async (req, res, next) => {
    const oid = req.body.id
    const status = req.body.status

    if (!ObjectId.isValid(oid) || typeof status !== "boolean") {
        return res.status(400).json({ message: "Bad request. The request has to include a valid MongoDB Object-ID named 'id' as well as a 'status' field of type boolean!" })
    }

    try {
        await updateBeverageOrderStatus(oid, status)
        return res.status(200).json({ message: "Successfully updated the 'finished' status of the ordered beverages!" })
    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "At least one of the specified beverage-order IDs could not be found!" })
        }
        console.log(error)
        return res.status(500).json({ message: "An unexpected error occured!" })
    }
})

router.patch("/updateBeverageAmount", async (req, res, next) => {
    const bid = req.body.beverageOrderId
    const amount = req.body.amount

    if (!ObjectId.isValid(bid) || typeof amount !== "number") {
        return res.status(400).json({ message: "Bad request. The request has to include a valid beverage-order id and an amount field that holds a number!" })
    }

    try {

        await updateBeverageAmount(bid, amount)

        return res.status(200).json({ message: "Successfully updated the ordered beverage!" })

    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "At least one of the specified beverage-order IDs could not be found!" })
        }

        console.log(error)
        return res.status(500).json({ message: "An unexpected error occured!" })
    }
})

router.delete("/deleteOneBeverage", async (req, res, next) => {
    const bid = req.body.beverageOrderId

    if (!ObjectId.isValid(bid)) {
        return res.status(400).json({ message: "Bad request. The beverage-order id ('beverageOrderId') must be specified and should be a valid MongoDB Object-ID." })
    }

    try {
        await deleteOrderBeverage(bid)
        return res.status(200).json({ message: "Successfully deleted the beverage-order item!" })

    } catch (error) {
        if (error === 404) {
            return res.status(404).json({ message: "The specified beverage-order-id has not been found!" })
        }
        console.log(error)

        return res.status(500).json({ message: "An unexpected error occured!" })
    }

})

// Functions

// Get

function getBeveragesForOrder(id) {

    return OrderBeverage.find({
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

function getOrdersWithOpenBeverages() {

    return OrderBeverage.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: today,
                    $lt: tomorrow
                },
                finished: false
            }
        },
        {
            $group: {
                _id: '$orderId'
            }
        }
    ]).then(docs => {
        if (docs) {
            console.log(docs)
            return Promise.resolve(docs)
        }
    }).catch(error => {
        console.log(error)
        return Promise.reject(500)
    })
}

// Create

function createOrderBeverage(orderBeverage) {

    return orderBeverage.save().then(result => {
        console.log(result);
        return Promise.resolve(result)
    })
        .catch((error) => {
            console.log(error);
            return Promise.reject(500)
        })
}

// Patch
function updateBeverageOrderStatus(oid, status) {
    return OrderBeverage.updateMany(
        { "orderId": oid },
        {
            "$set": {
                finished: status
            }
        }).then(result => {
            console.log(result);
            if (result.n > 0) {
                return Promise.resolve(200)
            }
        }).catch(error => {
            console.log(error);
            return Promise.reject(500)
        })
}

function updateBeverageAmount(beverageOrderId, amount) {
    return OrderBeverage.updateOne(
        { "_id": beverageOrderId },
        {
            "$set": {
                amount: amount
            }
        }).then(result => {
            console.log(result);
            if (result.n > 0) {
                return Promise.resolve(200)
            }
            return Promise.reject(404)
        }).catch(error => {
            console.log(error);
            return Promise.reject((error === 404) ? 404 : 500)
        })
}

// Delete

function deleteOrderBeverage(bid) {
    return OrderBeverage.deleteOne({ _id: bid }).then(result => {
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

module.exports = router