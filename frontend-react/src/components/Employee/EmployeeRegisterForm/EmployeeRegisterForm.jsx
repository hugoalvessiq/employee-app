import { useState } from "react";
import api from "../../../api/api";

import "./EmployeeRegisterForm.css";
import { useNavigate } from "react-router-dom";

const EmployeeRegisterForm = () => {
  const [employee, setEmployee] = useState({
    name: "",
    age: "",
    position: "",
    salary: "",
    contact: "",
    promotions: [
      {
        date: "",
        new_position: "",
        bonus: 0,
      },
    ],
    admission_date: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    setMessage("");

    // If it is the promotions field, try parsing the JSON
    if (name === "promotions") {
      try {
        newValue = JSON.parse(value.trim()); // Try converting to JSON array
      } catch (error) {
        console.error("Erro ao processar promoções:", error);
        newValue = employee.promotions; // In case of error, leave as empty array
      }
    } else if (name === "age" || name === "salary") {
      newValue = parseFloat(value); // Convert to number if it is age or salary
    }

    setEmployee((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to your API
      const response = await api.post("/protected/employee", employee);
      if (response.status === 201) {
        setMessage("Dados enviados com sucesso!");
        setTimeout(() => {
          setMessage("");
        }, 2000);
        console.log("Dados enviados com sucesso!");
        navigate("/protected/employee");
        // Additional logic after successful submission
      } else {
        setMessage("Erro ao enviar os dados.");
        console.error("Erro ao enviar os dados.");
      }

      setEmployee({
        name: "",
        age: "",
        position: "",
        salary: "",
        contact: "",
        promotions: [
          {
            date: "",
            new_position: "",
            bonus: 0,
          },
        ],
        admission_date: "",
      });
    } catch (error) {
      setMessage(error.response.data.message);
      console.error("Erro ao enviar dados:", error);
    }
  };

  return (
    <div className="form-container">
      {message && <div className="message">{message}</div>}
      <h1 className="form-title">Register Employee</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Name"
          value={employee.name}
          name="name"
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={employee.age}
          name="age"
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="text"
          placeholder="Position"
          value={employee.position}
          name="position"
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="number"
          placeholder="Salary"
          value={employee.salary}
          name="salary"
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="text"
          placeholder="Email Contact"
          value={employee.contact}
          name="contact"
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="date"
          placeholder="Date of Admission"
          value={employee.admission_date}
          name="admission_date"
          onChange={handleChange}
          className="form-input"
          required
        />
        <button type="submit" className="btn-submit">
          Criar Usuário
        </button>
      </form>
    </div>
  );
};
export default EmployeeRegisterForm;
