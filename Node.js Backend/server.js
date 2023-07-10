const express = require("express");
const cors = require("cors");
const app = express();
const authenticationRouter = require("./routers/Authentication");
const userRouter = require("./routers/User");
const theaterRouter = require("./routers/Theater");
const ticketRouter = require("./routers/Ticket");
const movieRouter = require("./routers/Movie");
const bodyParser = require("body-parser");
const tokenValidator = require("./TokenValidator");
app.use(cors());
app.use(bodyParser.json());
app.use("/authentication", authenticationRouter);

app.use((req, res, next) => {
  // Exclude authentication controller routes from token validation
  if (req.originalUrl.startsWith("/authentication")) {
    return next();
  }

  // Call your tokenValidator function to validate the token
  const token = req.headers.authorization;
  const isValid = tokenValidator.tokenValidator(token.split(" ")[1]);

  // Handle token validation result
  if (isValid) {
    next();
  } else {
    // Token is invalid, return an error response
    return res.status(401).json({
      key: "UNAUTORHORIZED",
      body: null,
      message: "You are not authorized to perform this action.",
    });
  }
});
app.use("/user", userRouter);
app.use("/theater", theaterRouter);
app.use("/ticket", ticketRouter);
app.use("/movie", movieRouter);
app.listen(3001);
