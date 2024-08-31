import { Link } from "react-router-dom";
import "./Nopage.css";

const Nopage = () => {
  return (
    <div className="container-full">
      <div className="nopage-container">
        <h1>404</h1>
        <p>Oops! The page you are looking for was not found.</p>
        <Link to="/" className="home-link">
          Back to Home
        </Link>
      </div>
      <span className="credit">
        Image from{" "}
        <a href="https://pixabay.com/pt/users/_namfon_-16559457/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5375005">
          Sasimaporn Moonthep
        </a>{" "}
        of{" "}
        <a href="https://pixabay.com/pt//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5375005">
          Pixabay
        </a>
      </span>
    </div>
  );
};
export default Nopage;
