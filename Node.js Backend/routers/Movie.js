const express = require("express");
const router = express.Router();
const connection = require("../helpers/config.js");
router.get("/showing", async (req, res) => {
  const resultBody = [];
  let query =
    "SELECT DISTINCT  m.id, m.name, m.director, m.description, m.genre, m.language, m.subtitle, m.rating, m.price, m.image_url FROM Movie m, MovieSeance ms, Showtime s WHERE m.id = ms.movieId AND s.id = ms.showtimeId AND s.datetime > CURRENT_DATE"; //returns currently showing movies..

  connection.query(query, async (error, result) => {
    if (error) {
      return res.status(500).json({ key: "INTERNAL_SERVER_ERROR", body: null });
    } else {
      const moviePromises = result.map(async (movie) => {
        let curShowtimes = await fetchShowTimesAndTheaters(movie["id"]);
        let curMovieInfo = {
          movieName: movie["name"],
          movieId: movie["id"],
          director: movie["director"],
          description: movie["description"],
          genre: movie["genre"],
          rating: movie["rating"],
          posterURL: movie["image_url"],
          price: movie["price"],
          language: movie["language"],
          subtitle: movie["subtitle"],
          showTimes: curShowtimes,
        };
        return curMovieInfo;
      });

      try {
        const movies = await Promise.all(moviePromises);
        resultBody.push(...movies);

        return res.status(200).json({ key: "SUCCESS", body: resultBody });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ key: "INTERNAL_SERVER_ERROR", body: null });
      }
    }
  });
});

router.get("/information", async (req, res) => {
  const movieId = req.query.movieId;
  let query = "SELECT * FROM Movie WHERE id = ?";
  let params = [movieId];
  connection.query(query, params, async (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ key: "INTERNAL_SERVER_ERROR", body: null });
    } else {
      let movie = result[0];
      let curShowtimes = await fetchShowTimesAndTheatersWithSeats(movieId);
      let curMovieInfo = {
        movieName: movie["name"],
        movieId: movie["id"],
        director: movie["director"],
        description: movie["description"],
        genre: movie["genre"],
        rating: movie["rating"],
        posterURL: movie["image_url"],
        price: movie["price"],
        showTimes: curShowtimes,
      };
      return res.status(200).json({ key: "SUCCESS", body: curMovieInfo });
    }
  });
});
const fetchShowTimesAndTheaters = async (movieId) => {
  let query =
    "SELECT * FROM MovieSeance ms JOIN Movie m ON ms.movieId = m.id JOIN Showtime s ON ms.showtimeId = s.id JOIN Theater t ON ms.theaterId = t.id WHERE m.id = ?";
  let params = [movieId];

  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      let showTimes = result.map((curSeance) => ({
        id: curSeance.showtimeId,
        dateTime: new Date(curSeance.datetime)
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        theater: curSeance.name,
        theaterId: curSeance.theaterId,
      }));

      resolve(showTimes);
    });
  });
};
const fetchShowTimesAndTheatersWithSeats = async (movieId) => {
  let query =
    "SELECT * FROM MovieSeance ms JOIN Movie m ON ms.movieId = m.id JOIN Showtime s ON ms.showtimeId = s.id JOIN Theater t ON ms.theaterId = t.id WHERE m.id = ?";
  let params = [movieId];

  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      let showTimes = result.map(async (curSeance) => {
        const occupiedSeats = await fetchOccupiedSeats(
          movieId,
          curSeance.showtimeId,
          curSeance.theaterId
        );

        return {
          id: curSeance.showtimeId,
          dateTime: new Date(curSeance.datetime)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
          theater: curSeance.name,
          theaterId: curSeance.theaterId,
          occupiedSeats: occupiedSeats,
        };
      });

      Promise.all(showTimes)
        .then((showTimesWithOccupiedSeats) => {
          resolve(showTimesWithOccupiedSeats);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

const fetchOccupiedSeats = async (movieId, showtimeId, theaterId) => {
  return new Promise((resolve, reject) => {
    let resultObj = [];
    let query =
      "WITH seats(seatId) as (WITH tempTable (movieSeanceId) as (SELECT id from MovieSeance WHERE movieId = ? AND theaterId = ? AND showtimeId = ?) SELECT seatId FROM Ticket t, tempTable temp WHERE t.movieSeanceId = temp.movieSeanceId) SELECT * FROM Seat s, seats s2 WHERE s.id = s2.seatId and s.theaterId = ?";
    let params = [movieId, theaterId, showtimeId, theaterId];
    connection.query(query, params, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      for (const curSeat of result) {
        let curSeat2 = {
          row: curSeat["rowLetter"],
          column: curSeat["columnNumber"],
        };
        resultObj.push(curSeat2);
      }
      resolve(resultObj);
    });
  });
};

module.exports = router;
