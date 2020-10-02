const express = require("express");

const sessionManager = require("../session");
const io = require("../socket");

const router = express.Router();

router.get("/getAllSessions", async (req, res, next) => {
  try {
    const sessions = await sessionManager.getAllSessions();
    res.status(200).json({ result: sessions });
  } catch (error) {
    console.error(500);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.get("/enableService", async (req, res, next) => {
  try {
    const currentSession = await sessionManager.getCurrentSession();
    await sessionManager.setActiveStatus(currentSession._id, true);

    io.getIO().emit("config-changed");

    return res.status(200).json({ message: "Service access for customers has been enabled!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.get("/disableService", async (req, res, next) => {
  try {
    const currentSession = await sessionManager.getCurrentSession();
    await sessionManager.setActiveStatus(currentSession._id, false);
    return res.status(200).json({ message: "Service access for customers has been disabled!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

module.exports = router;
