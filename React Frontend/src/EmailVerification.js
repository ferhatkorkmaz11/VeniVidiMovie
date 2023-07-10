import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [code, setCode] = useState("");
    const configuration = require("./config.json");
    const verifyEmail = async (e) => {
        e.preventDefault();
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "email": localStorage.getItem("email"),
            "code": code
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        console.log(requestOptions)

        fetch(configuration.endpoint + "/authentication/verify", requestOptions)
            .then(response => response.text())
            .then(result => {
                let resultJSON = JSON.parse(result);
                console.log(resultJSON)
                if (resultJSON.key === "SUCCESS") {
                    localStorage.clear();
                    localStorage.setItem("token", resultJSON.body.token);
                    localStorage.setItem("userId", resultJSON.body.userId);
                    window.location.href = "/home";   
                }
                else {
                    alert(resultJSON.message)
                }
            })
            .catch(error => console.log('error', error));

    }

    const handleSendCode = async () => {
        const email = localStorage.getItem("email")
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "email": email
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(configuration.endpoint + "/authentication/sendCode", requestOptions)
            .then(response => response.text())
            .then(result => {
                let resultJSON = JSON.parse(result);
                if (resultJSON.key === "SUCCESS") {
                    
                }
            })
            .catch(error => console.log('error', error));
    }

    useEffect(() => {
        handleSendCode()
    }, [])

    return (
        <div className="login-page">
            <h1 className="logo">Veni Vidi Movie</h1>
            <form className="login-form" onSubmit={verifyEmail}>
                <h2>Verify Your Email</h2>
                <label>Verification Code</label>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <div className="button-container">
                    <button className="login-btn">Verify</button>
                </div>
            </form>
        </div>
    );
};

export default Login;
