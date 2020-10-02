const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const app = express(); // init express
const port = process.env.PORT || 3000;
const server = require("http").createServer(app);
const basicAuth = require("express-basic-auth");

const User = require("./models/user");
const sessionManager = require("./session");
const statisticsManager = require("./statistics");

const MailService = require("./mail-service");

mongoose
  .connect("mongodb://127.0.0.1:27017/ordry", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(async result => {
    // 127.0.0.1:27017
    console.log("Successfully connected to db!");

    try {
      MailService.verifyConnection();
      const sessions = await sessionManager.getAbortedSessions();
      console.log(sessions);
      await Promise.all(
        sessions.map(async s => {
          // Finish the aborted sessions
          await statisticsManager.generateStatistics(new Date(s.date), undefined, undefined, s._id);
          await sessionManager.setActiveStatus(s._id, false);
        })
      );
      await sessionManager.setupEmptySession();
    } catch (error) {
      console.error(error);
    }
    const io = require("./socket").init(server);
    server.listen(port);
    io.on("connection", socket => {
      // triggers everytime we get a new connection
      console.log("New connection!");
    });
  })
  .catch(error => {
    console.error(error);
    console.log("Error connecting to the database!");
  });

app.use(morgan("dev")); // use the dev-logger

app.use(cors());

// parse the incoming request bodys
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/stats-pdfs", express.static("stats-pdfs"));
app.use(express.static("checklist-uploads"));

const publicRoutes = require("./routes/public-routes");

app.use("/api/public/", publicRoutes);

app.use(
  basicAuth({
    authorizer: ordryAuth,
    authorizeAsync: true,
    unauthorizedResponse: {
      message: "The Ordry-Auth service could not verify the provided login data."
    }
  })
);

async function ordryAuth(username, password, callback) {
  // callback(null, true) - error, or boolean value indicating if the request is legit
  try {
    console.log("Username is:", username, "Password is: ", password);

    const user = await getUserByUsername(username);
    if (user && basicAuth.safeCompare(Buffer.from(password).toString("base64"), user.password))
      callback(null, true);
    else callback(null, false);
  } catch (error) {
    callback(null, false);
  }
}

const sessionRoute = require("./routes/session-route");
const emailRoute = require("./routes/email-route");
const checklistRoute = require("./routes/checklist");
const beverageRoute = require("./routes/beverage");
const beverageSizesRoute = require("./routes/beverage-sizes");
const foodRoute = require("./routes/food");
const menuRoute = require("./routes/menu");
const orderRoute = require("./routes/order/order");
const statisticRoute = require("./routes/statistics-route");
const userRoute = require("./routes/users");

app.use("/api/", statisticRoute);
app.use("/api/", sessionRoute);
app.use("/api/", emailRoute);
app.use("/api/", userRoute);

app.use("/api/checklist/", checklistRoute);

app.use("/api/beverages/", beverageRoute);

app.use("/api/beverage-sizes/", beverageSizesRoute);

app.use("/api/food/", foodRoute);

app.use("/api/menu", menuRoute);

app.use("/api/order/", orderRoute);

app.use((err, req, res, next) => {
  if (err.code == "INCORRECT_FILETYPE") {
    res.status(422).json({ error: "INCORRECT_FILETYPE" });
    return;
  }
  if (err.code == "LIMIT_FILE_SIZE") {
    res.status(422).json({ error: "LIMIT_FILE_SIZE" });
  }
});

app.use("/", (req, res, next) => {
  res.status(404).json({ message: "Oops! Our API can't handle your request." });
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

module.exports = app;
