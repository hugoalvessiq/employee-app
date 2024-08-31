import { FaHome, FaRegUser, FaSearch } from "react-icons/fa";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import logout from "../../utils/logout";
import { MdLogout } from "react-icons/md";
import { useEffect } from "react";
import { LuLogIn } from "react-icons/lu";

const Navbar = () => {
  const { token, username } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link className="home active" to="/">
          <FaHome /> Home
        </Link>
        <Link to="/protected/search">
          <FaSearch /> Search
        </Link>
        {!token ? (
          <div>
            <Link to="/login">
              <LuLogIn /> Sign in
            </Link>
            <Link to="/register">
              <FaRegUser /> Register
            </Link>
          </div>
        ) : (
          <div className="user-id-container">
            <Link onClick={logout} className="sign-out">
              <MdLogout /> Sign out
            </Link>
            <Link to={`/protected/user`}>
              {" "}
              <span className="user-name"> Hello, {username}</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
