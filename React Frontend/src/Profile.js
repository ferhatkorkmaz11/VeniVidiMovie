import React, { useState, useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import EditProfilePopup from "./EditProfilePopup";

function Profile() {
  const [user, setUser] = useState();
  const configuration = require("./config.json");
  const [loading, setLoading] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [popupType, setPopupType] = useState("")
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let userId = parseInt(localStorage.getItem("userId"));
    let token = "Bearer " + localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(configuration.endpoint + `/user/profile?userId=${userId}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert("Ooops! Something went wrong.");
        } else {
          let curUser = {
            name: resultJSON.body.name,
            email: resultJSON.body.email,
          };
          let previousMovies = resultJSON.body.pastMovies;
          setUser(curUser);
          setWatchedMovies(previousMovies);
          setLoading(true);
        }
      })
      .catch((error) => console.log("error", error));
  };

 
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
          {loading ?
            <div>
              <h1>Hi, {user.name}</h1>
              <p>
                <b>Email:</b> {user.email}&emsp;
                <AiOutlineEdit size={20} onClick={() => {setTrigger(true); setPopupType("email")}} />
              </p>
              <button onClick={() => {setTrigger(true); setPopupType("password")}}>Change My Password</button>
              <br></br><br></br>
              <u>
                <h2>My Movies</h2>
              </u>
              <table className="movie-table">
                <tbody>
                  <tr>
                    {watchedMovies.map((movie) => (
                      <td key={movie.title}>
                        <center>
                          <img src={movie.imageUrl} alt={movie.movieName} />
                          <div className="movie-info">
                            <p>{movie.movieName}</p>
                            <p>by</p>
                            <p>{movie.director}</p>
                          </div>
                        </center>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div> :
            <div className="spinner-overlay">
              <div className="spinner">
                <div className="circle"></div>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>}
        </center>
        <EditProfilePopup trigger={trigger} setTrigger={setTrigger} popupType={popupType}></EditProfilePopup>
      </div>
    );
}

export default Profile;