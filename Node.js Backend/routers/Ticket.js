const express = require("express");
const router = express.Router();
const connection = require("../helpers/config.js");
const nodemailer = require("nodemailer");

router.post("/purchase", (req, res) => {
  const {
    userId,
    movieId,
    showtimeId,
    theaterId,
    seat,
    credit_card,
  } = req.body;
  const token = req.headers["token"];
  const { row, column } = seat;
  console.log(row + column);
  msQuery = `SELECT m.id AS movieSeanceId, Movie.price AS transaction_price, DATE_FORMAT(datetime, '%M %e, %Y %h:%i %p') AS datetime, Movie.name as movieName, s.id AS seatId, Theater.name as theaterName FROM MovieSeance AS m, Theater, Showtime, Movie, Seat AS s WHERE m.movieId = '${movieId}' AND m.movieId = Movie.id AND  m.theaterId = s.theaterId AND m.showtimeId = '${showtimeId}' AND m.showtimeId = Showtime.id AND m.theaterId = '${theaterId}' AND m.theaterId = Theater.id AND s.rowLetter = '${row}' AND s.columnNumber='${column}'`;
  connection.query(msQuery, (error, result) => {
    if (error || result.length == 0) {
      console.log(error);
      return res
        .status(500)
        .json({ key: "INTERNAL_SERVER_ERROR", ticketId: null });
    } else {
      const movieSeanceId = result[0].movieSeanceId;
      const seatId = result[0].seatId;
      const movie_name = result[0].movieName;
      const date_time = result[0].datetime;
      const theater_name = result[0].theaterName;
      const transaction_price = result[0].transaction_price;
      insertQuery = `INSERT INTO Ticket(userId, seatId, movieSeanceId)
                            SELECT ${userId}, ${seatId}, ${movieSeanceId}
                            FROM dual
                            WHERE NOT EXISTS (
                                SELECT *
                                FROM Ticket as t
                                WHERE t.seatId = ${seatId}
                                AND t.movieSeanceId = ${movieSeanceId}
                            )
                        `;
      connection.query(insertQuery, (error, result) => {
        if (error || result.affectedRows === 0) {
          console.log(error);
          return res
            .status(500)
            .json({ key: "INTERNAL_SERVER_ERROR", ticketId: null });
        } else {
          const ticketId = result.insertId;
          userQuery = `SELECT name, email FROM User AS u WHERE u.id = '${userId}' `;

          connection.query(userQuery, (error, results) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .json({ key: "INTERNAL_SERVER_ERROR", ticketId: null });
            } else {
              const user_name = results[0].name;
              const user_email = results[0].email;

              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "gmail_address,
                  pass: "gmail_pass",
                },
              });
              const emailText = `Dear ${user_name},\n\nYour ticket purchase has been successful. The ticket details here:\n\n The movie: ${movie_name}, \n The date: ${date_time},\n The theater ${theater_name}, \n The seat ${row}-${column}, \n The ticket price: \$ ${transaction_price}.\n\nThank you for your purchase!`;

              const mailOptions = {
                from: "gmail_address",
                to: `${user_email}`,
                subject: "Ticket Purchase Confirmation",
                text: emailText,
              };

              // Send email using the transporter
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email:", error);
                  return res
                    .status(500)
                    .json({ key: "INTERNAL_SERVER_ERROR", ticketId: null });
                } else {
                  console.log("Email sent:", info.response);
                  return res.status(200).json({ key: "SUCCESS", ticketId });
                }
              });

              return res.status(200).json({ key: "SUCCESS", ticketId });
            }
          });
        }
      });
    }
  });
});


router.delete("/cancel", (req, res) => {
  const userId = req.query.userId;
  const ticketId = req.query.ticketId;

  msQuery = `SELECT t.movieSeanceId AS movieSeanceId, m.name AS movie_name, m.price AS transaction_price FROM Ticket AS t, Movie AS m, MovieSeance AS ms WHERE t.id = '${ticketId}' AND t.userId = '${userId}' AND t.movieSeanceId = ms.id AND ms.movieId = m.id`;

  connection.query(msQuery, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ key: "INTERNAL_SERVER_ERROR" });
    } else {
      const movieSeanceId = result[0].movieSeanceId;
      const movie_name = result[0].movie_name;
      const transaction_price = result[0].transaction_price;

      delQuery = `DELETE FROM Ticket WHERE id = '${ticketId}' AND movieSeanceId = '${movieSeanceId}';`;

      connection.query(delQuery, (error, result) => {
        if (error || result.affectedRows === 0) {
          console.log(error);
          return res.status(500).json({ key: "INTERNAL_SERVER_ERROR" });
        } else {
          userQuery = `SELECT name, email FROM User AS u WHERE u.id = '${userId}' `;
          console.log(userQuery);
          connection.query(userQuery, (error, results) => {
            if (error) {
              console.log(error);
              return res.status(500).json({ key: "INTERNAL_SERVER_ERROR" });
            } else {
              const user_name = results[0].name;
              const user_email = results[0].email;

              const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: "gmail_address",
                  pass: "gmail_pass",
                },
              });
              const emailText = `Dear ${user_name},\n\nYour ticket for ${movie_name} has been deleted successfully. The ticket price:\$ ${transaction_price} will be refunded to your account. \n\n`;
              console.log(emailText);
              const mailOptions = {
                from: "gmail_address",
                to: `${user_email}`,
                subject: "Ticket Cancellation Confirmation",
                text: emailText,
              };

              // Send email using the transporter
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email:", error);
                  return res.status(500).json({ key: "INTERNAL_SERVER_ERROR" });
                } else {
                  console.log("Email sent:", info.response);
                  return res.status(200).json({ key: "SUCCESS" });
                }
              });
            }
          });
        }
      });
    }
  });
});


router.get("/information", (req, res) => {
  const userId = req.query.userId;
  const token = req.headers["token"]; // It will be connected later...

  ticketQuery = `SELECT Ticket.id as ticketId ,m.name as movieName, m.price as price, s.datetime as datetime, t.name as theaterName, rowLetter, columnNumber
                    FROM User as u, Movie as m, Showtime as s, Theater as t, Seat, MovieSeance as ms, Ticket
                    WHERE Ticket.userId = '${userId}' AND u.id = Ticket.userId AND Ticket.seatId = Seat.id AND ms.id = Ticket.movieSeanceId AND ms.movieId = m.id AND ms.showtimeId = s.id AND ms.theaterId = t.id`;
  connection.query(ticketQuery, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ key: "INTERNAL_SERVER_ERROR" });
    } else if (result.length == 0) {
      return res
        .status(200)
        .json({ key: "SUCCESS", message: "There is no ticket yet" });
    } else {
      const responseBody = [];

      result.forEach((result) => {
        const ticket = {
          movieName: result.movieName,
          datetime: result.datetime,
          theater: result.theaterName,
          seatRow: result.rowLetter,
          seatColumn: result.columnNumber,
          price: result.price,
          ticketId: result.ticketId,
        };
        responseBody.push(ticket);
      });

      return res.status(200).json({
        body: responseBody, // Return the results array as the response body
        key: "SUCCESS",
      });
    }
  });
});

module.exports = router;
