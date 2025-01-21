import React, { useState } from "react";
import "./loginSignup.css";
import userIcon from "../assets/person.png";
import passwordIcon from "../assets/password.png";
import phoneIcon from "../assets/email.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  //starea locala pt actiunea curenta - signup
  const [action, setAction] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();//fol pt redirectionare

  const handleAction = async () => {
    try {
      // validari
      if (!username || !password) {
        alert("Please fill out all required fields.");
        return;
      }
      if (!/^[A-Z]/.test(username)) {
        alert("Username must start with an uppercase letter.");
        return;
      }
      if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }
      if (action === "Sign Up") {
        if (!phoneNumber || phoneNumber.length < 10 || !/^\d+$/.test(phoneNumber)) {
          alert("Phone number must be at least 10 digits and contain only numbers.");
          return;
        }

        //cerere pt inregistrare utilizator nou
        const response = await axios.post("http://localhost:5000/register", {
          username,
          password,
          phoneNumber,
        });
        console.log("User registered:", response.data);
        alert("Registration successful! Please log in.");
        setAction("Login");//schimbam la login
      } else {
        //cerere login
        const response = await axios.post("http://localhost:5000/login", {
          username,
          password,
        });
        console.log("Logged in successfully:", response.data);
        navigate(`/app/${username}`);//redirectionare app 
      }
    } catch (error) {
      console.error("Action failed:", error.message);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underLine"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <img src={userIcon} alt="User Icon" />
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input">
          <img src={passwordIcon} alt="Password Icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {action === "Sign Up" && (
          <div className="input">
            <img src={phoneIcon} alt="Phone Icon" />
            <input
              type="text"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="submitContainer">
        <button className="submit" onClick={handleAction}>
          {action}
        </button>
      </div>
      {/* pt schimbare intre actiuni */}
      <div className="toggleAction">
        <span onClick={() => setAction(action === "Sign Up" ? "Login" : "Sign Up")}>
          Switch to {action === "Sign Up" ? "Login" : "Sign Up"}
        </span>
      </div>
    </div>
  );
};

export default LoginSignup;