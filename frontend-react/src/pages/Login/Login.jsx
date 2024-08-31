import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { BounceLoader } from "react-spinners";

import "./Login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/login", { name, password });
      const { token } = response.data;

      // Save token localStorage
      localStorage.setItem("token", `token=${token}`);
      localStorage.setItem("username", `${name}`);

      // Update context
      dispatch({ type: "LOGIN", payload: { token, username: name } });
      console.log("User logged");

      navigate("/"); // Redirects to the main page
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Login error, check if the password or name is correct!");
    } finally {
      setMessage("");
      setLoading(false);
    }
  };

  return (
    <>
      {message && <p className="message">{message}</p>}
      <form className="login-container" onSubmit={(e) => handleLogin(e)}>
        {loading ? (
          <div className="loader-container">
            <BounceLoader color="#36d7b7" />
          </div>
        ) : (
          <div className="login-form">
            <h2>Entrar</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="login-input"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default Login;
