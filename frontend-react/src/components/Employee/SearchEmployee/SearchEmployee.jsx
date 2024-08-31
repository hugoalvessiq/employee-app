import { useState, useEffect } from "react";
import api from "../../../api/api";
import { Link } from "react-router-dom";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { PropagateLoader } from "react-spinners";

import "./SearchEmployee.css";

function SearchEmployee() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery !== "") {
      handleSearch(searchQuery);
    } else {
      setSearchResults([]);
      setSelectedEmployee(null);
      setErrorMessage("");
    }
  }, [searchQuery]);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/protected/employees?q=${query}`);
      setSearchResults(response.data);
      setLoading(false);
    } catch (error) {
      setSearchResults([]);
      console.error("Error fetching search results:", error);
      setLoading(false);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.name);
    setErrorMessage("");
    setSearchResults([]);
  };

  const handleSearchSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/protected/employees?q=${searchQuery}`);
      if (
        response.data.length > 0 &&
        response.data[0].name.toLowerCase() === searchQuery.toLocaleLowerCase()
      ) {
        setSearchResults([]);
        setSelectedEmployee(response.data[0]);
        setSearchQuery(response.data[0].name);
        setErrorMessage("");
      } else {
        setErrorMessage("User not found.");
        setSearchResults([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error searching employee:", error);
      setErrorMessage("User not found.");
      setSearchResults([]);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="search-container">
        <Link to={`/`} className="link-home">
          <FaArrowAltCircleLeft className="icon" /> Home
        </Link>
        <h3 className="title">Search Employee</h3>
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
        <div className="search-wrapper">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="suggestions">
                {searchResults.map((employee) => (
                  <li
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className="suggestion-item"
                  >
                    {employee.name} - {employee.position}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleSearchSubmit}
            disabled={searchQuery === "" || loading}
            className="btn-search"
          >
            Search
          </button>
        </div>
        <div className="spinner">
          {loading && (
            <div className="spinner">
              <PropagateLoader color="#36d7b7" size={20} />
            </div>
          )}
        </div>

        
        {selectedEmployee && (
          <>
            <h3 className="table-title">User Data</h3>
            <table className="data-table">
              <tbody>
                <tr>
                  <th>ID:</th>
                  <td>{selectedEmployee.id}</td>
                </tr>
                <tr>
                  <th>Nome:</th>
                  <td>{selectedEmployee.name}</td>
                </tr>
                <tr>
                  <th>Idade:</th>
                  <td>{selectedEmployee.age}</td>
                </tr>
                <tr>
                  <th>Profissão:</th>
                  <td>{selectedEmployee.position}</td>
                </tr>
                <tr>
                  <th>Salário:</th>
                  <td>{selectedEmployee.salary}</td>
                </tr>
                <tr>
                  <th>Email:</th>
                  <td>{selectedEmployee.contact}</td>
                </tr>
                <tr>
                  <th>Promotions</th>
                  <td>
                    {selectedEmployee.promotions.map((item, id) => (
                      <ul key={id}>
                        {/* Format the promotion date */}
                        <li className="promotion-item">
                          {item.new_position} - (
                          {new Date(item.date).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          ) - Bônus: R$ {item.bonus}
                        </li>
                      </ul>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}

export default SearchEmployee;
