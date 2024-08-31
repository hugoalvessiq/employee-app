import { useState, useEffect } from "react";
import api from "../../../api/api";
import Employee from "../../EmployeeDetails/Employee";
import { PulseLoader } from "react-spinners";
import { Link } from "react-router-dom";
import { FaArrowAltCircleLeft, FaPlus } from "react-icons/fa";
import { useEmployeeContext } from "../../../context/EmployeeContext";

import "./EmployeeDetail.css";

const EmployeeDetails = () => {
  const { employees } = useEmployeeContext();

  const [employeesData, setEmployeesData] = useState(null);

  useEffect(() => {
    api
      .get("/protected/employees")
      .then((response) => setEmployeesData(response.data))
      .catch((error) =>
        console.error(
          "Error searching for person:",
          error.response.data.message
        )
      );
  }, [employees]);

  if (!employeesData) {
    return (
      <div className="loading-container">
        <h2 className="loading-title">Searching for employee(s)</h2>
        <PulseLoader color="#36d7b7" />
      </div>
    );
  }

  const content = employeesData.map((employee) => (
    <Employee key={employee.id} employee={employee} />
  ));

  return (
    <div className="employee-details-container">
      <Link to={`/`} className="link-home">
        <FaArrowAltCircleLeft className="icon" /> Home
      </Link>
      <div className="table-container">
        <Link to={`/protected/create`} className="btn btn-employee">
          <FaPlus /> Add Employee
        </Link>
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Admission Date</th>
              <th>Nome</th>
              <th>Idade</th>
              <th>Position</th>
              <th>Salário</th>
              <th>Contact</th>
              <th>Promotions/Bonus</th>
            </tr>
          </thead>
          <tbody>{content}</tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDetails;
