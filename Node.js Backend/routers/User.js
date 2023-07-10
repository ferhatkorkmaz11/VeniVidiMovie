const express = require("express");
const router = express.Router();
const connection = require("../helpers/config.js");

router.patch("/editProfile", (req, res) => {
  const token = req.headers["token"]; // It will be connected later...
  const { userId, newEmail, newName } = req.body;

  query = `SELECT COUNT(*) FROM User as u WHERE u.email = '${newEmail}' AND u.id = '${userId}'`;
  connection.query(query, (error, result) => {
    if (error) {
      return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
    } else {
      if (result[0] == 1) {
        query2 = `UPDATE User  SET name = '${newName}'  WHERE id = '${userId}';`;
        connection.query(query2, (error, result) => {
          if (error) {
            console.log(error);
            return res
              .status(500)
              .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
          } else {
            return res.status(200).json({
              key: "SUCCESS",
            });
          }
        });
      } else {
        query3 = `SELECT COUNT(*) FROM User as u WHERE u.email = '${newEmail}' AND u.id <> '${userId}'`;
        connection.query(query3, (error, result) => {
          if (error) {
            console.log(error);

            return res
              .status(500)
              .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
          } else {
            if (result[0] > 0) {
              return res.status(419).json({
                body: null,
                key: "EMAIL_ALREADY_EXISTS",
                message: "Email already exists.",
              });
            } else {
              query4 = `UPDATE  User as u SET email = '${newEmail}', name = '${newName}' WHERE u.id = '${userId}'`;
              connection.query(query4, (error, result) => {
                if (error) {
                  if (error.code === "ER_DUP_ENTRY") {
                    return res.status(419).json({
                      body: null,
                      key: "EMAIL_ALREADY_EXISTS",
                      message: "Email already exists.",
                    });
                  }
                  return res
                    .status(500)
                    .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
                } else {
                  return res.status(200).json({
                    key: "SUCCESS",
                  });
                }
              });
            }
          }
        });
      }
    }
  });
});

router.get("/profile", async (req, res) => {
  const token = req.headers["token"]; // It will be connected later... If token works, we may not need to mail as body
  const userId = req.query.userId;

  const query = `SELECT name, email, movies FROM User WHERE id = ?`;
  const params = [userId];

  try {
    connection.query(query, params, async (error, result) => {
      if (error || result.length === 0) {
        console.log(error);
        return res
          .status(500)
          .json({ body: null, key: "INTERNAL_SERVER_ERROR" });
      } else {
        const pastMovies = await fetchPastMovieInfo(
          JSON.parse(result[0].movies)
        );
        return res.status(200).json({
          body: {
            name: result[0].name,
            email: result[0].email,
            pastMovies: pastMovies,
          },
          key: "SUCCESS",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ body: null, key: "INTERNAL_SERVER_ERROR" });
  }
});

const fetchPastMovieInfo = async (pastMovies) => {
  let resultArray = [];
  const uniqueArray = [...new Set(pastMovies)];
  for (const curMovieId of uniqueArray) {
    let intMovieId = parseInt(curMovieId);
    let query = "SELECT name, director, image_url FROM Movie WHERE id = ?";
    let params = [intMovieId];

    // Wrap the database query in a Promise for better async/await support
    const movieInfoPromise = new Promise((resolve, reject) => {
      connection.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    try {
      const result = await movieInfoPromise;

      let curMovieInfo = {
        movieName: result[0]["name"],
        director: result[0]["director"],
        imageUrl: result[0]["image_url"],
      };

      resultArray.push(curMovieInfo);
    } catch (error) {
      // Handle the error appropriately (e.g., logging, error propagation, etc.)
      console.error("Error fetching movie info:", error);
    }
  }

  return resultArray;
};

module.exports = router;
