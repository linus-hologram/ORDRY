const express = require("express");
const router = express.Router();

const Email = require("../models/email"); // get the model

router.post("/addEmail/", async (req, res, next) => {
  let emailString = req.body.email;

  if (typeof emailString !== "string" || emailString.length == 0) {
    return res
      .status(400)
      .json({ message: "Bad request. The email must be of type string and is mandatory!" });
  }

  let emailObj = new Email({
    email: emailString
  });

  try {
    await addEmail(emailObj);
    return res.status(200).json({ message: "Successfully added the email to the database!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "An unexpected error occured! Please make sure that the specified email doesn't already exist!"
      });
  }
});

function addEmail(email) {
  return email
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

module.exports = router;
