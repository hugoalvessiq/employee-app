/* eslint-disable react/prop-types */
import "./Employee.css";

import { useEmployeeContext } from "../../context/EmployeeContext";
import { Link } from "react-router-dom";
import api from "../../api/api";

const Employee = ({ employee }) => {
  const { dispatch } = useEmployeeContext();
  if (employee) {
    // Format the admission date
    const formattedAdmissionDate = new Date(
      employee.admission_date
    ).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const handleDelete = async (taskId) => {
      try {
        await api({
          method: "delete",
          url: `/protected/employee/${taskId}`,
        });

        dispatch({ type: "DELETE_EMPLOYEE", payload: employee });
        console.log("Employee successfully deleted!");
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    };

    const handleDeleteWithConfirmation = (taskId) => {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this employee?"
      );
      if (isConfirmed) {
        handleDelete(taskId);
      }
    };

    return (
      <tr>
        <td className="btn--group">
          <button
            onClick={() => handleDeleteWithConfirmation(employee.id)}
            className="btn--delete"
          >
            Delete
          </button>

          <Link
            to={`/protected/update/${employee.id}`}
            className="btn--employee--update name-label"
          >
            Update
          </Link>
        </td>
        <td>{formattedAdmissionDate}</td>
        <td>{employee.name}</td>
        <td>{employee.age}</td>
        <td>{employee.position}</td>
        <td>R$ {employee.salary}</td>
        <td>{employee.contact}</td>
        <td>
          {employee.promotions.map((item) => (
            <ul key={item.id + `${Math.random()}`}>
              <li className="list--table">
                {item.new_position} {item.new_position && "-"} (
                {new Date(item.date).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                ) {item.bonus && "-"} Bônus: R$ {item.bonus}
              </li>
            </ul>
          ))}
        </td>
      </tr>
    );
  } else {
    return null;
  }
};

export default Employee;
