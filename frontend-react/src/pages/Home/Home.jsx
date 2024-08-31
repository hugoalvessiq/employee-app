import "./Home.css";

import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { token } = useAuthContext();
  return (
    <div className="home-container">
      <main className="home-content">
        <h1>Welcome to the Employee Registration App</h1>
        <p>Manage your employees efficiently.</p>
        {token && (
          <div className="home-buttons">
            <Link to="/protected/create" className="btn">
              Create
            </Link>
            <Link to="/protected/search" className="btn">
              Search
            </Link>
            <Link to="/protected/employee" className="btn">
              List Employee
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
export default Home;
