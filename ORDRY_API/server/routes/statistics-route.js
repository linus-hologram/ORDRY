const express = require("express");

const router = express.Router();

const statisticsManager = require("../statistics");
const sessionManager = require("../session");

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

router.post("/generateStatistics/", async (req, res, next) => {
  const actualTurnover = req.body.turnover; // der IST-Stand der Kassa
  const message = req.body.message; // die Nachricht, welche vom Personal eingetragen wird

  if (typeof actualTurnover !== "number" || !message || typeof message !== "string") {
    return res.status(400).json({
      message:
        "Bad request! Please specify both message and turnover in the request, featuring the corresponding data type!"
    });
  }

  try {
    const currentSession = await sessionManager.getCurrentSession();
    await statisticsManager.generateStatistics(today, actualTurnover, message, currentSession);
    res.status(200).json({ message: "Generated the statistics!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});

router.get("/getSoleTurnover/", async (req, res, next) => {
  try {
    const turnover = await statisticsManager.generateSoleTurnover(today);
    res.status(200).json({ turnover: turnover });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occured!" });
  }
});
module.exports = router;
