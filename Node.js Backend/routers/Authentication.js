const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../helpers/config.js");
const tokenValidator = require("../TokenValidator");
const nodemailer = require("nodemailer");

router.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  let query = `SELECT COUNT(*) as curCount FROM User WHERE email = '${email}'`;
  connection.query(query, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    } else {
      console.log(result[0]["curCount"]);
      if (result[0]["curCount"] !== 0) {
        return res.status(419).json({
          body: null,
          key: "EMAIL_ALREADY_EXISTS",
          message: "User already exists.",
        });
      } else {
        bcrypt.genSalt(10, (error, salt) => {
          if (error) {
            console.log(error);
            return res
              .status(500)
              .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
          } else {
            bcrypt.hash(password, salt, (error, hashedPassword) => {
              if (error) {
                console.log(error);
                return res
                  .status(500)
                  .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
              } else {
                query = `INSERT INTO User(name, email, password_salt, hashed_password) VALUES('${name}', '${email}', '${salt}', '${hashedPassword}')`;
                connection.query(query, (error, result) => {
                  if (error) {
                    console.log(error);
                    return res
                      .status(500)
                      .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
                  } else {
                    const token = jwt.sign({ email }, process.env.JWT_KEY);
                    return res.status(200).json({
                      body: null,
                      key: "SUCCESS",
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let query = "SELECT * FROM User WHERE email = ?";
  let params = [email];
  connection.query(query, params, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    }
    if (result.length === 0) {
      return res.status(404).json({
        key: "EMAIL_NOT_FOUND",
        body: null,
        message: "Email address not found.",
      });
    } else {
      let curUser = result[0];
      let dbHashedPassword = result[0]["hashed_password"];
      let dbPasswordSalt = result[0]["password_salt"];
      bcrypt.hash(password, dbPasswordSalt, (error, hashedPassword) => {
        if (hashedPassword === dbHashedPassword) {
          const token = jwt.sign({ email }, process.env.JWT_KEY);
          return res.status(200).json({
            key: "SUCCESS",
            body: {
              email: email,
              userId: result[0]["id"],
              token,
              isVerified: curUser.is_verified === 1,
            },
          });
        } else {
          return res.status(403).json({
            key: "INCORRECT_PASSWORD",
            body: null,
            message: "Your login credentials are not correct.",
          });
        }
      });
    }
  });
});

router.patch("/changePassword", (req, res) => {
  if (tokenValidator.tokenValidator(req.headers.authorization.split(" ")[1])) {
    const userId = req.body.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    let query = "SELECT * FROM User WHERE id = ?";
    let params = [userId];
    connection.query(query, params, (error, result) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
      }
      if (result.length === 0) {
        return res.status(404).json({
          key: "EMAIL_NOT_FOUND",
          body: null,
          message: "Email address not found.",
        });
      } else {
        let dbHashedPassword = result[0]["hashed_password"];
        let dbPasswordSalt = result[0]["password_salt"];
        bcrypt.hash(oldPassword, dbPasswordSalt, (error, hashedPassword) => {
          if (hashedPassword === dbHashedPassword) {
            bcrypt.hash(
              newPassword,
              dbPasswordSalt,
              (error, newHashedPassword) => {
                query = "UPDATE User SET hashed_password = ? WHERE id = ?";
                params = [newHashedPassword, userId];
                connection.query(query, params, (error, result) => {
                  if (error) {
                    console.log(error);
                    return res
                      .status(500)
                      .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
                  } else {
                    return res.status(200).json({
                      body: null,
                      key: "SUCCESS",
                      message:
                        "You have successfully changed your password. Please re-login.",
                    });
                  }
                });
              }
            );
          } else {
            return res.status(403).json({
              key: "INCORRECT_OLD_PASSWORD",
              body: null,
              message: "Your old password is not correct.",
            });
          }
        });
      }
    });
  } else {
    return res.status(401).json({
      key: "UNAUTORHORIZED",
      body: null,
      message: "You are not authorized to perform this action.",
    });
  }
});

router.post("/forgottenPassword", (req, res) => {
  const email = req.body.email; // Fix: Assign req.body.email to email variable
  let query = "SELECT * FROM User WHERE email = ?";
  let params = [email];
  connection.query(query, params, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    }
    if (result.length === 0) {
      return res.status(404).json({
        key: "EMAIL_NOT_FOUND",
        body: null,
        message: "Email address not found.",
      });
    } else {
      let resetCode = generateRandomString(11);
      let userId = result[0]["id"];
      let userName = result[0]["name"];
      query = "UPDATE User SET password_reset_code = ? WHERE id = ?";
      params = [resetCode, userId];
      connection.query(query, params, (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
        } else {
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.GMAIL_ADDRESS,
              pass: process.env.GMAIL_PASS,
            },
          });
          const mailOptions = {
            // Fix: Separate assignment with semicolon
            from: process.env.GMAIL_ADDRESS,
            to: email,
            subject: "Veni Vidi Movie Password Reset Request",
            text:
              "Dear " +
              userName +
              ",\nYour code for resetting your password for Veni Vidi Movie is: " +
              resetCode,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
            } else {
              return res.status(200).json({
                body: null,
                key: "SUCCESS",
                message: "We have sent a code to reset your password.",
              });
            }
          });
        }
      });
    }
  });
});

router.patch("/forgottenPasswordChange", (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  const newPassword = req.body.newPassword;
  let query = "SELECT * FROM User WHERE email = ?";
  let params = [email];
  connection.query(query, params, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    }
    if (result.length === 0) {
      return res.status(404).json({
        key: "EMAIL_NOT_FOUND",
        body: null,
        message: "Email address not found.",
      });
    } else {
      let user = result[0];
      if (user["password_reset_code"] !== code) {
        return res.status(401).json({
          key: "PASSWORD_RESET_CODE_INCORRECT",
          body: null,
          message: "Password reset code is incorrect.",
        });
      } else {
        bcrypt.hash(
          newPassword,
          user["password_salt"],
          (error, hashedPassword) => {
            query = "UPDATE User SET hashed_password = ? WHERE email = ?";
            params = [hashedPassword, email];
            connection.query(query, params, (error, result) => {
              if (error) {
                console.log(error);
                return res
                  .status(500)
                  .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
              } else {
                return res.status(200).json({
                  body: null,
                  key: "SUCCESS",
                  message:
                    "You have successfully changed your password. Please re-login.",
                });
              }
            });
          }
        );
      }
    }
  });
});
router.post("/sendCode", (req, res) => {
  const email = req.body.email;
  let code = generateRandomString(11);
  let query = "SELECT * FROM User WHERE email = ?";
  connection.query(query, [email], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    }
    if (result.length === 0) {
      return res.status(404).json({
        key: "EMAIL_NOT_FOUND",
        body: null,
        message: "Email address not found.",
      });
    } else {
      let curUser = result[0];
      query = "UPDATE User SET verification_code = ? WHERE email = ?";
      connection.query(query, [code, email], (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
        } else {
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.GMAIL_ADDRESS,
              pass: process.env.GMAIL_PASS,
            },
          });
          const mailOptions = {
            // Fix: Separate assignment with semicolon
            from: process.env.GMAIL_ADDRESS,
            to: email,
            subject: "Verify Your Veni Vidi Movie Account",
            text:
              "Dear " +
              curUser.name +
              ",\nYour code for verifying your  Veni Vidi Movie Account is: " +
              code,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
            } else {
              return res.status(200).json({
                body: null,
                key: "SUCCESS",
                message: "We have sent a code to verify your account.",
              });
            }
          });
        }
      });
    }
  });
});

router.post("/verify", (req, res) => {
  const code = req.body.code;
  const email = req.body.email;
  let query = "SELECT * FROM User WHERE email = ?";
  connection.query(query, [email], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    }
    if (result.length === 0) {
      return res.status(404).json({
        key: "EMAIL_NOT_FOUND",
        body: null,
        message: "Email address not found.",
      });
    }
    let curUser = result[0];
    if (curUser.verification_code === code) {
      query = "UPDATE User SET is_verified = 1 WHERE email = ?";
      connection.query(query, [email], (error, result) => {
        if (error) {
          console.log(error);
          return res
            .status(500)
            .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
        } else {
          const token = jwt.sign(curUser["email"], process.env.JWT_KEY);
          const userId = curUser.id;
          return res.status(200).json({
            body: {
              email: email,
              userId: userId,
              token,
              isVerified: true,
            },
            key: "SUCCESS",
            message: "",
          });
        }
      });
    } else {
      return res.status(401).json({
        key: "VERIFICATION_CODE_IS_WRONG",
        body: null,
        message: "The verification code provided is not correct.",
      });
    }
  });
});
/**
 * @param string length
 * @returns random generated String
 */
function generateRandomString(length) {
  (charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
    (retVal = "");
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = router;
