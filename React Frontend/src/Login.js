import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const configuration = require("./config.json");
  const handleLogin = (e) => {
    e.preventDefault();

    // Create an object with the request data

    // Make the fetch request
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      password: password,
      email: email,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(configuration.endpoint + "/authentication/login", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          toast.error(resultJSON.message);
        } else {
          if (resultJSON.body.isVerified === true) {
            localStorage.setItem("token", resultJSON.body.token);
            localStorage.setItem("userId", resultJSON.body.userId);
            window.location.href = "/home";
          }
          else {
            localStorage.setItem("email", email)
            window.location.href = "/verification";
          }
        }
      })
      .catch((error) => console.log("error", error));
  };

  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("userId"))
      window.location.href = "/home";
  }, []);

  return (
    <div className="login-page">
      <h1 className="logo">Veni Vidi Movie</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        <div className="button-container">
          <button type="submit" className="login-btn">
            Login
          </button>
          <Link to="/register">
            <button className="register-btn">Register</button>
          </Link>
        </div>
      </form>
      <p
        className="forgot-password"
        onClick={() => {
          window.location.href = "/forgotten-password";
        }}
      >
        Forgot your password?
      </p>
      <ToastContainer />
    </div>
  );
};

export default Login;
