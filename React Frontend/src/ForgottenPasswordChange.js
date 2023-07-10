import React, { useState } from "react";
import "./Register.css";

function ForgottenPasswordChange() {
  const configuration = require("./config.json");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChangePassword = (formData) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      code: code,
      newPassword: password,
      email: email,
    });

    var requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      configuration.endpoint + "/authentication/forgottenPasswordChange",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert(resultJSON.message);
        } else {
          alert(resultJSON.message);
          window.location.href = "/";
        }
      })
      .catch((error) => console.log("error", error));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleChangePassword({ code, email, password });
  };

  return (
    <div className="register-container">
      <h1>Veni Vidi Movie</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Code:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
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

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ForgottenPasswordChange;
