const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;
const Beverage = require('../models/beverage'); // get the model

// Routes

router.get("/getAvailableSizes/:id", async (req, res, next) => {
    const beverageId = req.params.id

    if (beverageId === undefined || typeof beverageId !== "string" || beverageId == "" || !ObjectId.isValid(beverageId)) {
        return res.status(400).json({ message: "Beverage id must be a valid MongoDB Object-ID, specified in the url!" })
    }

    try {
        const result = await getBeverageWithId(beverageId)

        if (result === 404) {
            return res.status(result).send({ message: "404. No matching beverage found!" })
        } else {
            const sizes = result[0].sizes
            const output = []
            for (const size of sizes) {
                if (size.available === true) {
                    console.log(size)
                    output.push(size)
                }
            }

            return res.status(200).json({ availableSizes: output })
        }

    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }
})

router.get("/getSizeById/:beverageId/:sizeId", async (req, res, next) => {
    const beverageId = req.params.beverageId
    const sizeId = req.params.sizeId

    if (typeof beverageId !== "string" || !ObjectId.isValid(beverageId) || typeof sizeId !== "string" || !ObjectId.isValid(sizeId)) {
        return res.status(400).json({ message: "Beverage id and Size id must be a valid MongoDB Object-ID, specified in the url!" })
    }

    try {
        const result = await getBeverageWithId(beverageId)

        if (result === 404) {
            return res.status(result).send({ message: "404. No matching documents found!" })
        } else {
            const sizes = result[0].sizes
            for (const size of sizes) {
                if (size._id == sizeId) {
                    console.log(size)
                    return res.status(200).json({ size: size })
                }
            }

            return res.status(404).send({ message: "404. No matching beverage size found!" })
        }

    } catch (error) {
        console.log(error)
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }
})

router.post("/addSize", async (req, res, next) => {
    const beverageId = req.body.id
    const size = req.body.size

    if (typeof beverageId !== "string" || !ObjectId.isValid(beverageId) || size === undefined) {
        return res.status(400).json({ message: "The size and beverage id have to be specified! The beverage id must be a valid MongoDB Object-ID!" })
    }

    if (typeof size.name !== "string" || size.name == "" || typeof size.available !== "boolean" || typeof size.price !== "number") {
        return res.status(400).json({ message: "Bad request. The size has to be specified as follows: {'id': 'anyid', 'size': {'name': '0,5 l', 'price': 3.5, 'available': false}}" })
    }

    const bsize = {
        _id: ObjectId(),
        name: size.name,
        price: size.price,
        available: size.available
    }

    try {

        const result = await getBeverageWithId(beverageId)

        if (result === 404) {
            return res.status(result).send({ message: "404. No matching beverage found!" })
        } else {
            result[0].sizes.push(bsize)
            result[0].save()
            return res.status(200).json({ size: bsize, message: "Beverage-Size has been added!" });
        }

    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }
})

router.patch("/updateSizeAvailability", async (req, res, next) => {
    const beverageId = req.body.id
    const sizeId = req.body.sizeId
    const isAvailable = req.body.available

    if (typeof isAvailable !== "boolean" || typeof beverageId !== "string" || !ObjectId.isValid(beverageId) || typeof sizeId !== "string" || !ObjectId.isValid(sizeId)) {
        return res.status(400).json({ message: "The size id and the beverage id have to be specified and must be a valid MongoDB Object-ID! The 'available' field has to be a boolean!" })
    }

    try {

        const result = await updateBeverageAvailability(beverageId, sizeId, isAvailable)

        res.status(result).json({ message: (result === 404) ? "404. Beverage or Beverage-Size not found by the specified IDs." : "Sucessfully updated the beverage-size!" })

    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }


})

router.delete("/deleteSize", async (req, res, next) => {
    const beverageId = req.body.id
    const sizeId = req.body.sizeId

    if (typeof beverageId !== "string" || !ObjectId.isValid(beverageId) || typeof sizeId !== "string" || !ObjectId.isValid(sizeId)) {
        return res.status(400).json({ message: "The size id and the beverage id have to be specified and must be a valid MongoDB Object-ID!" })
    }

    try {

        const result = await deleteBeverageSize(beverageId, sizeId)

        if (result === 404) {
            res.status(result).send({ message: "404. No matching beverage or beverage size found for the specified IDs!" })
        } else {
            res.status(200).json({ message: "Sucessfully deleted the specified beverage-size!" })
        }

    } catch (error) {
        res.status(error).json({ message: "An unexpected error occured." }) // send back as json
    }

})

// Functions

function getBeverageWithId(id) {
    return Beverage.find({ _id: id }).then(doc => {
        if (doc[0]) {
            console.log(doc)
            return Promise.resolve(doc)
        } else {
            return Promise.resolve(404)
        }
    }).catch(error => {
        console.log("Error: ", error)
        return Promise.reject(500)
    })
}

function updateBeverageAvailability(beverageId, sizeId, isAvailable) {
    return Beverage.updateOne(
        { "_id": beverageId, "sizes._id": sizeId },
        {
            "$set": {
                "sizes.$.available": isAvailable
            }
        }).then(result => {
            console.log(result);
            if (result.n > 0) {
                return Promise.resolve(200)
            } else {
                return Promise.resolve(404)
            }
        }).catch(error => {
            console.log(error);
            return Promise.reject(500)
        })
}

function deleteBeverageSize(beverageId, sizeId) {
    return Beverage.findOne({ '_id': beverageId, 'sizes._id': sizeId }).then(result => {
        console.log(result)

        if (result) {

            result.sizes = result.sizes.filter(size => {
                return size._id != sizeId;
            })

            result.save()

            return Promise.resolve(result)
        } else {
            return Promise.resolve(404)
        }
    }).catch(error => {
        console.log(error)
        return Promise.reject(500)
    })
}

module.exports = router