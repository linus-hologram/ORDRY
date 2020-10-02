const express = require("express");

const router = express.Router();
const User = require("../models/user");

router.post("/change-password", async (req, res, next) => {
  const reqUsername = req.auth.user; // the user that is sending the request
  const newPassword = req.body.newPassword; // the new password
  const username = Buffer.from(req.body.username, "base64").toString("ascii"); // the username whose password should be changed

  console.log(reqUsername, newPassword, username);

  if (!reqUsername) {
    res.status(401).json({
      message: "The Ordry-Auth service could not authenticate the request."
    });
  }

  if (!newPassword || newPassword.length < 6 || !username) {
    // at least 6 characters required for the new password
    return res.status(400).json({
      message:
        "Please specify a 'username' and a 'newPassword' field in your request and make sure that the entered password has at least 6 characters!"
    });
  }

  try {
    const reqUser = await getUserByUsername(reqUsername);

    if (reqUser.role !== "admin") {
      return res.status(401).json({
        message:
          "We are not sure what you're trying to do here, but the Ordry-Auth Service didn't permit this action."
      });
    }

    const user = await getUserByUsername(username); // fetch the user whose password should be changed

    if (user.role === "admin") {
      console.log("The request user is:", reqUser, user);
      console.log("User ids are:", user._id, reqUser._id);
      if (user._id.equals(reqUser._id)) {
        // only allow the password change of an admin user if the auth credentials of the request match, i.e. the user tries to change his own password
        await changeUserPassword(username, newPassword);
      } else {
        return res.status(401).json({
          message:
            "We're afraid to tell you that you can't change the passwords of other admin users. The Ordry-Auth Service refused the operation."
        });
      }
    } else {
      await changeUserPassword(username, newPassword);
    }

    return res.status(200).json({
      message: "Successfully changed the password for the specified user!"
    });
  } catch (error) {
    console.error(error);
    if (error === 404) {
      return res.status(404).json({
        message: "We tried really hard but couldn't find the specified user."
      });
    }
    res.status(500).json({ message: "An unexpected error happened!" });
  }
});

router.get("/getAllEmployeeUsers", async (req, res, next) => {
  const reqUsername = req.auth.user; // the user that is sending the request

  try {
    const reqUser = await getUserByUsername(reqUsername);

    if (reqUser.role !== "admin") {
      return res.status(401).json({
        message:
          "We are not sure what you're trying to do here, but the Ordry-Auth Service didn't permit this action."
      });
    }

    const employees = await getAllEmployees();

    let outputArray = [];
    outputArray.push({ _id: reqUser._id, username: reqUser.username, role: reqUser.role });

    employees.forEach(e => {
      outputArray.push({ _id: e._id, username: e.username, role: e.role });
    });

    return res.status(200).json({ users: outputArray });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error happened!" });
  }
});

router.get("/getUserRole", async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.auth.user);
    return res.status(200).json({ role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "We could not verify your identity!" });
  }
});

function getUserByUsername(uname) {
  return User.findOne({ username: uname })
    .then(result => {
      if (result) return Promise.resolve(result);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function getAllEmployees() {
  return User.find({ role: "employee" })
    .then(result => {
      if (result) return Promise.resolve(result);
      else return Promise.reject(404);
    })
    .catch(error => {
      console.error(error);
      return Promise.reject(error);
    });
}

function changeUserPassword(username, password) {
  console.log("Username and password are:", username, password);
  return User.findOneAndUpdate(
    { username: username },
    {
      password: password
    }
  )
    .then(result => {
      console.log(result);
      return Promise.resolve(200);
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error);
    });
}

module.exports = router;
