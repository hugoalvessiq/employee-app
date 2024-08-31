import axios from "axios";

const logout = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8000/logout",
      {},
      {
        withCredentials: true, // Include cookies in requests
      }
    );
    console.log(response.data); // Success message, for example: "User logged out"

    // Remove token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Redirect or update application state as needed
    window.location.href = "/"; // Redirects to login or home page
  } catch (error) {
    console.error("Logout failed", error);
    // Handle error, for example, show an error message to the user
  }
};

export default logout;
