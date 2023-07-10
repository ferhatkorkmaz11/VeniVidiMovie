import React, { useState } from "react";
import "./Register.css";

function ForgottenPassword() {
  const configuration = require("./config.json");
  const [email, setEmail] = useState("");

  const handleRegister = (formData) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      email: email,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      configuration.endpoint + "/authentication/forgottenPassword",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        let resultJSON = JSON.parse(result);
        if (resultJSON.key !== "SUCCESS") {
          alert(resultJSON.message);
        } else {
          alert(resultJSON.message);
          window.location.href = "/forgotten-password-change";
        }
      })
      .catch((error) => console.log("error", error));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRegister({ email });
  };

  return (
    <div className="register-container">
      <h1>Veni Vidi Movie</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button type="submit">Send Code</button>
      </form>
    </div>
  );
}

export default ForgottenPassword;
