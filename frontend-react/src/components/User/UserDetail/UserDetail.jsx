import { useEffect, useState } from "react";
import { useUserContext } from "../../../context/UserContext";
import api from "../../../api/api";

import "./UserDetail.css";

import logout from "../../../utils/logout";

const UserDetail = () => {
  const { dispatch } = useUserContext();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    api
      .get("/protected/user")
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) =>
        console.error("Erro ao buscar usuário:", error.response.data.message)
      );
  }, []);

  useEffect(() => {
    if (userData) {
      dispatch({ type: "GET_USER", payload: userData });
    }
  }, [userData, dispatch]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleDelete = async (userId) => {
    try {
      await api({
        method: "delete",
        url: `/protected/user/${userId}`,
      });

      // Remove token localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      console.log("User successfully deleted!");

      logout();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteWithConfirmation = (taskId) => {
    const isConfirmed = window.confirm("Are you sure you want your account?");
    if (isConfirmed) {
      handleDelete(taskId);
    }
  };

  return (
    <div className="user-detail-container">
      <div className="user-card">
        <h2 className="user--name">
          <span>Name</span>: {userData.name}
        </h2>
        <p className="user-id">ID: {userData.id}</p>
        <div className="user-roles">
          <h3>Role(s)</h3>
          <ul>
            {userData.roles.map((role, index) => (
              <li key={index}>
                <span className="role-name">{role.roles}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => handleDeleteWithConfirmation(userData.id)}
          className="btn--delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserDetail;
