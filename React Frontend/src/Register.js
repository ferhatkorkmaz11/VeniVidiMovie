import React, { useState } from "react";
import "./Register.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const configuration = require("./config.json");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const handleRegister = (formData) => {
    if (formData.password !== formData.rePassword) {
      toast.error('Passwords do not match.');
    }
    else {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        name: name,
        password: password,
        email: email,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(configuration.endpoint + "/authentication/register", requestOptions)
        .then((response) => response.text())
        .then((result) => {
          let resultJSON = JSON.parse(result);
          if (resultJSON.key !== "SUCCESS") {
            toast.error(resultJSON.message);
          } else {
            localStorage.setItem("email", email)
            window.location.href = "/verification";

          }
        })
        .catch((error) => console.log("error", error));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRegister({ name, email, password, rePassword });
  };

  return (
    <div className="register-container">
      <h1>Veni Vidi Movie</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label htmlFor="re-password">Re-enter Password:</label>
        <input
          type="password"
          id="re-password"
          name="re-password"
          required
          value={rePassword}
          onChange={(event) => setRePassword(event.target.value)}
        />

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
      <ToastContainer />
    </div>
  );
}

export default Register;
