import { useState } from "react";
import api from "../../../api/api";
import { useAuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BounceLoader } from "react-spinners";

import "./CreateUser.css";

const CreateUser = () => {
  const [user, setUser] = useState({
    name: "",
    password: "",
    roles: [],
    create_date: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [createUser, setCreateUser] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, checked } = e.target;

    setMessage("");

    if (name === "manager" || name === "employee") {
      setUser((prevState) => {
        let newRoles = [...prevState.roles];

        const roleIndex = newRoles.findIndex((role) => role.roles === name);
        if (checked && roleIndex === -1) {
          newRoles.push({ roles: name });
        } else if (!checked && roleIndex !== -1) {
          newRoles.splice(roleIndex, 1);
        }
        return { ...prevState, roles: newRoles };
      });
    } else {
      setUser((prevState) => ({
        ...prevState,
        [name]: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/register", user);
      setMessage("User created successfully!", response);
      setCreateUser(true);
      console.log("User created successfully!");

      // Perform login after successfull registration
      const loginResponse = await api.post("/login", {
        name: user.name,
        password: user.password,
      });

      const { token } = loginResponse.data;

      // Save token and username
      localStorage.setItem("token", `token=${token}`);
      localStorage.setItem("username", user.name);

      dispatch({ type: "LOGIN", payload: { token, username: user.name } });

      navigate("/"); // Redirect to home
    } catch (error) {
      console.log(error.response.data);

      setMessage(`Error creating user: ${error.response.data.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {message && (
        <p className={createUser ? "message-login" : "message"}>{message}</p>
      )}
      {loading ? (
        <div className="spinner-container">
          <BounceLoader color="#36d7b7" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Name"
            value={user.name}
            name="name"
            onChange={handleChange}
            className="form-input"
            required
          />
          <label>
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              name="password"
              onChange={handleChange}
              className="form-input password"
              required
            />
            <p className="label-password">
              *The password must have the characters [A-Z][a-z][!@#$%] <br />
              *Minimum length 8 characters
            </p>
          </label>
          <div className="checkbox-container">
            <label htmlFor="">
              <input
                type="checkbox"
                name="manager"
                id="manager"
                checked={user.roles.some((role) => role.roles === "manager")}
                onChange={handleChange}
                className="form-checkbox"
              />
              Manager
            </label>
            <label htmlFor="">
              <input
                type="checkbox"
                name="employee"
                id="employee"
                checked={user.roles.some((role) => role.roles === "employee")}
                onChange={handleChange}
                className="form-checkbox"
              />
              Employee
            </label>
          </div>
          <input
            type="date"
            placeholder="Create date"
            value={user.create_date}
            name="create_date"
            onChange={handleChange}
            className="form-input"
            required
          />
          <button type="submit" className="btn-submit">
            Criar Usuário
          </button>
        </form>
      )}
    </div>
  );
};
export default CreateUser;
