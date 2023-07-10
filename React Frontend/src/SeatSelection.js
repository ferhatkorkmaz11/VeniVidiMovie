import React, { useEffect, useState } from "react";
import "./SeatSelection.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const configuration = require("./config.json");
  const [movie, setMovie] = useState();
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [allSeats, setAllSeats] = useState([]);
  const [theater, setTheater] = useState("");
  const [showtime, setShowtime] = useState("");
  const [creditCardName, setCreditCardName] = useState("");
  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      await fetchMovieData();
    };

    let tempJSON = JSON.parse(localStorage.getItem("movieSeance"));
    setTheater(tempJSON.showTime.theater);
    setShowtime(tempJSON.showTime.dateTime);
    fetchData();
  }, []);

  useEffect(() => {
    if (movie) {
      populateSeatsServer();
    }
  }, [movie]);

  const populateSeatsServer = async () => {
    let movieSeance = localStorage.getItem("movieSeance");
    let movieSeanceJSON = JSON.parse(movieSeance);
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      configuration.endpoint +
      "/theater/seating?theaterId=" +
      movieSeanceJSON.showTime.theaterId,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSONSeat = JSON.parse(result);
        if (resultJSONSeat.key !== "SUCCESS") {
          alert("Oops something went wrong.");
        } else {
          let seats = [];

          if (Array.isArray(resultJSONSeat.body.defaultSeating)) {
            seats = resultJSONSeat.body.defaultSeating.map((seat) => {
              const isOccupied = occupiedSeats.some(
                (occupiedSeat) =>
                  occupiedSeat.row === seat.row &&
                  occupiedSeat.column === seat.column
              );
              return {
                seatRow: seat.row,
                seatNumber: seat.column,
                isOccupied: isOccupied,
              };
            });

            // group the seat data by row
            const groupedSeatData = seats.reduce((acc, seat) => {
              if (!acc[seat.seatNumber]) {
                acc[seat.seatNumber] = [];
              }
              acc[seat.seatNumber].push(seat);
              return acc;
            }, {});

            setAllSeats(groupedSeatData);
          }
        }
      })
      .catch((error) => console.log("error", error));
  };

  // group the seat data by row
  const handlePurchaseTicket = async () => {
    if (creditCardName !== "" && creditCardNumber !== "" && expiryDate !== "" && cvv !== "" && creditCardNumber.length === 19 && expiryDate.length === 5 && cvv.length === 3) {
      let movieSeance = localStorage.getItem("movieSeance");
      let movieSeanceJSON = JSON.parse(movieSeance);
      var myHeaders = new Headers();
      myHeaders.append(
        "Authorization",
        "Bearer " + localStorage.getItem("token")
      );
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        userId: parseInt(localStorage.getItem("userId")),
        movieId: movie.movieId,
        showtimeId: movieSeanceJSON.showTime.id,
        theaterId: movieSeanceJSON.showTime.theaterId,
        seat: {
          row: selectedSeats[0].seatRow,
          column: selectedSeats[0].seatNumber,
        },
        transaction_price: 42,
        credit_card: {
          owner_name: "TEMP",
          number: "1234 4567 8901 2345",
          cvv_code: "012",
        },
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(configuration.endpoint + "/ticket/purchase", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let resultJSON = JSON.parse(result);
          if (resultJSON.key !== "SUCCESS") {
            alert("Ooops! Something went wrong.");
          } else {
            window.location.href = "/home";
          }
        })
        .catch((error) => console.log("error", error));
    }
    else {
      toast.error('Please enter a valid credit card information!');
    }
  };

  const handleSeatSelect = (seat) => {
    if (
      occupiedSeats.some(
        (occupiedSeat) =>
          occupiedSeat.row === seat.seatRow &&
          occupiedSeat.column === seat.seatNumber
      )
    ) {
      // If the seat is occupied, do not allow selection
      return;
    }

    if (selectedSeats.length === 1 && selectedSeats[0] === seat) {
      // If the selected seat is already the only seat selected, unselect it
      setSelectedSeats([]);
    } else {
      setSelectedSeats([seat]);
    }
  };

  const handleCreditCardNumberInput = (e) => {
    const formattedNumber = e.target.value
      .replace(/[^\d]/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
    setCreditCardNumber(formattedNumber);
  }

  const handleExpiryDateInput = (e) => {
    const formattedDate = e.target.value
      .replace(/[^\d]/g, '')
      .replace(/(\d{2})(\d{2})/, '$1/$2')
      .trim();

    setExpiryDate(formattedDate);
  };

  const handleCvInput = (e) => {
    const formattedNumber = e.target.value
      .replace(/[^\d]/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
    setCvv(formattedNumber);
  }

  const fetchMovieData = async () => {
    let movieSeance = localStorage.getItem("movieSeance");
    let movieSeanceJSON = JSON.parse(movieSeance);
    let movieId = movieSeanceJSON.movieId;
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      configuration.endpoint + "/movie/information?movieId=" + movieId,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert("Ooops something went wrong.");
        } else {
          setMovie(resultJSON.body);
          let curOccupiedSeats = resultJSON.body.showTimes.find(
            (showTime) =>
              showTime.id === movieSeanceJSON.showTime.id &&
              showTime.theaterId === movieSeanceJSON.showTime.theaterId
          );

          setOccupiedSeats(curOccupiedSeats.occupiedSeats);
        }
      })
      .catch((error) => console.log("error", error));
  };
  if (movie && allSeats) {
    return (
      <div className="seat-selection-container">
        <center>
          <nav className="navbar">
            <center>
              <ul className="nav-links">
                <li>
                  <a href="/home">Home</a>
                </li>
                <li>
                  <a href="/profile">My Profile</a>
                </li>
                <li>
                  <a href="/my-tickets">My Tickets</a>
                </li>
                <li>
                  <a
                    href="/"
                    onClick={() => {
                      localStorage.clear();
                    }}
                  >
                    Sign Out
                  </a>
                </li>
              </ul>
            </center>
          </nav>
        </center>
        <div className="movie-name">
          <h6 className="mt-5">{movie.movieName}</h6>
          <h6 className="mt-5">{showtime}</h6>
          <h6 className="mt-5">{theater}</h6>
          <h6 className="mt-5">Price: ${movie.price}</h6>
        </div>
        <div className="scene-container">
          <div className="scene">Scene</div>
        </div>
        <div className="seats-container">
          {Object.entries(allSeats).map(([row, seats]) => (
            <div key={row}>
              <div>{row}</div>
              <div className="seats-row">
                {seats.map((seat) => (
                  <div
                    key={seat.seatRow + seat.seatNumber}
                    className={`seat ${seat.isOccupied ? "occupied" : ""} ${selectedSeats.includes(seat) ? "selected" : ""
                      }`}
                    onClick={() => handleSeatSelect(seat)}
                  >
                    {seat.seatRow + " - " + seat.seatNumber}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <br></br>

        <form className="credit-card-form">
          <input id="name" type="text" placeholder="Name" onChange={(e) => setCreditCardName(e.target.value)} />
          <input
            id="cardNumber"
            type="text"
            placeholder="Credit Card Number"
            maxLength={19}
            value={creditCardNumber}
            onChange={handleCreditCardNumberInput}
          />
          <div className="credit-card-details">
            <input id="expiryDate" type="text" placeholder="Expiry Date" maxLength={5} value={expiryDate} onChange={handleExpiryDateInput} />
            <input id="cvv" maxLength={3} type="text" placeholder="CVV" value={cvv} onChange={handleCvInput} />
          </div>
        </form>
        <button
          type="button"
          style={{ width: "300px", height: "75px" }}
          onClick={() => handlePurchaseTicket()}
          className="mt-3 btn btn-success"
        >
          Purchase Ticket
        </button>
        <br></br>
        <br></br>
        <ToastContainer />
      </div>
    );
  }
};

export default SeatSelection;
