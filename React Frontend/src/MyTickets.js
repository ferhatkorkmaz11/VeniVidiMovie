import React, { useState, useEffect } from "react";
import "./MyTickets.css";
import moment from 'moment';
import 'moment-timezone';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const MyTickets = () => {
  const configuration = require("./config.json");
  const [ticketData, setTicketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabSelection, setTabSelection] = useState(0);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    let userId = parseInt(localStorage.getItem("userId"));
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
      configuration.endpoint + "/ticket/information?userId=" + userId,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert("Ooops! Something went wrong.");
        } else {
          setTicketData(resultJSON.body);
          setLoading(true)
        }
      })
      .catch((error) => console.log("error", error));
  };
  const dateformatter = (date) => {
    const datetimeString = date;
    const formattedDatetime = moment.utc(datetimeString).format('YYYY-MM-DD HH:mm:ss');
    return formattedDatetime;
  };
  const handleCancelTicket = async (ticketId) => {
    let userId = parseInt(localStorage.getItem("userId"));
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );
    var requestOptions = {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      configuration.endpoint +
      "/ticket/cancel?ticketId=" +
      ticketId +
      "&userId=" +
      userId,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert("Ooops! Something went wrong.");
        } else {
          const notification = toast("The ticket has been cancelled successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 5000,
          });
          setTimeout(() => {
            toast.dismiss(notification); // Dismiss the notification
            window.location.href = "/my-tickets"; // Reload the page
          }, 5000);
        }
      })
      .catch((error) => console.log("error", error));
  };


  function displayTickets() {
    if (tabSelection === 0) {
      return (
        <div className="ticket-container">
          {ticketData
            .filter(ticket => new Date(dateformatter(ticket.datetime)) > new Date())
            .map((ticket, index) => (
              <div key={index} className="ticket">
                <div className="movie-info">
                  <h2>{ticket.movieName}</h2>
                  <p>{dateformatter(ticket.datetime)}</p>
                  <p>{ticket.theater}</p>
                </div>
                <center>
                  <div className="seat-info">
                    <h3>
                      Seat: {ticket.seatRow + " -"} {ticket.seatColumn}
                    </h3>
                    <p>Price: ${ticket.price}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      console.log(ticket);
                      handleCancelTicket(ticket.ticketId);
                    }}
                  >
                    Cancel Ticket
                  </button>
                </center>
              </div>
            ))}
            <ToastContainer />
        </div>
      );
    }
    else if (tabSelection === 1) {
      return (
        <div className="ticket-container">
          {ticketData
            .filter(ticket => new Date(dateformatter(ticket.datetime)) < new Date())
            .map((ticket, index) => (
              <div key={index} className="ticket">
                <div className="movie-info">
                  <h2>{ticket.movieName}</h2>
                  <p>{dateformatter(ticket.datetime)}</p>
                  <p>{ticket.theater}</p>
                </div>
                <center>
                  <div className="seat-info">
                    <h3>
                      Seat: {ticket.seatRow + " -"} {ticket.seatColumn}
                    </h3>
                    <p>Price: ${ticket.price}</p>
                  </div>
                </center>
              </div>
            ))}
        </div>
      );
    }    
  }

  if (ticketData) {
    return (
      <div>
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
        <center>
          <h1>My Tickets</h1>
          {loading ?
            <div>
              <ul className="nav nav-tabs justify-content-center">
                <li className="nav-item">
                  <a className="nav-link active" data-toggle="tab" href="" onClick={() => { setTabSelection(0) }}>Future Tickets</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" data-toggle="tab" href="" onClick={() => setTabSelection(1)}>Past Tickets</a>
                </li>
              </ul>
              {displayTickets()}
            </div>
            :
            <div className="spinner-overlay">
              <div className="spinner">
                <div className="circle"></div>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>}
        </center>
        
      </div>
    );
  } else {
    return (
      <div>
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
          <center>
            <h1>My Tickets</h1>
          </center>
          <center>
            <h2>Ooops! You have not purchased any ticket yet!</h2>
          </center>
        </center>
      </div>
    );
  }
};

export default MyTickets;
