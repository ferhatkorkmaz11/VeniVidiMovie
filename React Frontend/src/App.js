import React from "react";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Routes,
} from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import SeatSelection from "./SeatSelection";
import MyTickets from "./MyTickets";
import ForgottenPassword from "./ForgottenPassword";
import ForgottenPasswordChange from "./ForgottenPasswordChange";
import EmailVerification from ".//EmailVerification";
import "./App.css";
import Profile from "./Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route
          exact
          path="/forgotten-password"
          element={<ForgottenPassword />}
        />
        <Route
          exact
          path="/forgotten-password-change"
          element={<ForgottenPasswordChange />}
        />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/verification" element={<EmailVerification />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/seat" element={<SeatSelection />} />
        <Route exact path="/my-tickets" element={<MyTickets />} />
        <Route exact path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
