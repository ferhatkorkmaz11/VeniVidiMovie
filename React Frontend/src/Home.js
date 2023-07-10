import React, { useEffect, useState } from "react";
import "./Home.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ShowDetailsPopup from "./ShowDetailsPopup";

const Home = () => {
  const configuration = require("./config.json");
  const [movieData, setMovieData] = useState([]);
  const [movieSeance, setMovieSeance] = useState();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [trigger, setTrigger] = useState(false);


  useEffect(() => {
    fetchShowingMovies();
  }, []);
  const fetchShowingMovies = async () => {
    var myHeaders = new Headers();
    console.log(localStorage.getItem("token"));
    myHeaders.append(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(configuration.endpoint + "/movie/showing", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert("Something went wrong.");
        } else {
          setMovieData(resultJSON.body);
          console.log(resultJSON.body)
          setLoading(true)
        }
      })
      .catch((error) => console.log("error", error));
  };
  const handleSelectShowtime = (showTime, movie) => {
    setMovieSeance({ showTime, movieId: movie.movieId });
  };

  useEffect(() => {
    if (movieSeance) {
      localStorage.setItem("movieSeance", JSON.stringify(movieSeance));
      window.location.href = "/seat";
    }
  }, [movieSeance]);


  function showDescription(description, genre, language, subtitle, price, rating) {
    setDescription(description)
    setGenre(genre)
    setLanguage(language)
    setSubtitle(subtitle)
    setPrice(price)
    setRating(rating)
    setTrigger(true)
  }

  return (
    <div className="home-page">
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
        <h1>Veni Vidi Movie</h1>
        <h2>Movies Now Showing</h2>
      </center>
      <center>
        {loading ?
          <div className="movie-container">
            {movieData.map((movie) => (
              <div className="movie-card" key={movie.movieId}>
                <img src={movie.posterURL} alt="Movie Poster" />
                <div className="movie-details">
                  <h3>{movie.movieName}</h3>
                  {movie.director === "DEFAULT_DIRECTOR" ? <br></br> : <p>Director: {movie.director}</p>}            
                  <button type="button" onClick={() => {showDescription(movie.description, movie.genre, movie.language, movie.subtitle, movie.price, movie.rating)}} className="btn btn-info">Show Details</button>
                  <br></br>

                  <div className="dropdown mt-3">
                    <button
                      className="btn btn-info dropdown-toggle"
                      type="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select A Seance
                    </button>
                    <div className="dropdown-menu">
                      {movie.showTimes.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map((showTime) => {
                        console.log("movie date:")
                        console.log(new Date(showTime.dateTime))
                        console.log("current date:")
                        console.log(new Date())
                        if (new Date(showTime.dateTime) > new Date()) {
                          return (
                            <a
                              className="dropdown-item"
                              key={showTime.id}
                              onClick={() => {
                                handleSelectShowtime(showTime, movie);
                              }}
                            >
                              {showTime.dateTime}
                            </a>
                          );
                        }
                        else {
                          return (<div></div>);
                        }

                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div> :
          <div className="spinner-overlay">
            <div className="spinner">
              <div className="circle"></div>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      </center>
      <ShowDetailsPopup trigger={trigger} setTrigger={setTrigger} description={description} genre={genre} language={language} subtitle={subtitle} price={price} rating={rating}></ShowDetailsPopup>
    </div>
  );
};

export default Home;