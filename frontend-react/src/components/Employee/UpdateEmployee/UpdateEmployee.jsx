import { Link, useNavigate, useParams } from "react-router-dom";
import { useEmployeeContext } from "../../../context/EmployeeContext";
import { useEffect, useState } from "react";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import api from "../../../api/api";

import "./UpdateEmployee.css";

const UpdateEmployee = () => {
  const { dispatch } = useEmployeeContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState({
    name: "",
    age: "",
    position: "",
    salary: "",
    contact: "",
    promotions: [],
    admission_date: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await api.get(`/protected/employee/${id}`);
        const updatedEmployeeData = { ...response.data };
        setEmployeeData(updatedEmployeeData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handlePromotionChange = (index, field, value) => {
    const updatedPromotions = [...employeeData.promotions];
    updatedPromotions[index] = {
      ...updatedPromotions[index],
      [field]: value,
    };
    setEmployeeData({ ...employeeData, promotions: updatedPromotions });
  };

  const handleAddPromotion = () => {
    setEmployeeData({
      ...employeeData,
      promotions: [
        ...employeeData.promotions,
        {
          date: "",
          new_position: "",
          bonus: 0,
        },
      ],
    });
  };

  const handleRemovePromotion = (index) => {
    const updatedPromotions = [...employeeData.promotions];
    updatedPromotions.splice(index, 1);
    setEmployeeData({ ...employeeData, promotions: updatedPromotions });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    setMessage("");

    if (name === "promotions") {
      try {
        newValue = JSON.parse(value.trim());
      } catch (error) {
        console.error("Error processing promotions:", error);
        newValue = employeeData.promotions;
      }
    } else if (name === "age" || name === "salary") {
      newValue = parseFloat(value);
    }

    setEmployeeData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(`/protected/employee/${id}`, employeeData);
      if (response.status === 200) {
        setMessage("Data updated successfully!");
        setTimeout(() => {
          setMessage("");
        }, 2000);
        dispatch({ type: "UPDATE_EMPLOYEE", payload: employeeData });
        navigate("/protected/employee");
      } else {
        setMessage("Error updating data.");
        console.error("Error sending data.");
      }
    } catch (error) {
      setMessage(error.response.data.message);
      console.error("Error updating data:", error);
    }
  };

  return (
    <div className="form-container">
      <Link to={`/`} className="link-home">
        <FaArrowAltCircleLeft className="icon" /> Home
      </Link>
      {message && <div className="message">{message}</div>}
      <h1 className="form-title">Update Employee</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Name"
          value={employeeData.name}
          name="name"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          placeholder="Age"
          value={employeeData.age}
          name="age"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Position"
          value={employeeData.position}
          name="position"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="number"
          placeholder="Salary"
          value={employeeData.salary}
          name="salary"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Email Contact"
          value={employeeData.contact}
          name="contact"
          onChange={handleChange}
          className="form-input"
        />
        <input
          type="date"
          placeholder="Date of Admission"
          value={employeeData.admission_date}
          name="admission_date"
          onChange={handleChange}
          className="form-input"
        />
        {employeeData.promotions.map((promotion, index) => (
          <div key={index} className="promotion-section">
            <h3>Promotion {index + 1}</h3>
            <input
              type="date"
              placeholder="Promotion Date"
              value={promotion.date}
              onChange={(e) =>
                handlePromotionChange(index, "date", e.target.value)
              }
              className="form-input"
            />
            <input
              type="text"
              placeholder="New Position"
              value={promotion.new_position}
              onChange={(e) =>
                handlePromotionChange(index, "new_position", e.target.value)
              }
              className="form-input"
            />
            <input
              type="number"
              placeholder="Bonus"
              value={promotion.bonus}
              onChange={(e) =>
                handlePromotionChange(
                  index,
                  "bonus",
                  parseFloat(e.target.value)
                )
              }
              className="form-input"
            />
            <div className="promotion-buttons">
              <span className="promotion-optional">*Promotion is Optional</span>
              <button
                type="button"
                onClick={() => handleRemovePromotion(index)}
                className="btn btn-remove"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddPromotion}
          className="btn btn-add"
        >
          Add Promotion
        </button>
        <hr className="separator" />
        <button type="submit" className="btn btn-update">
          Update Employee
        </button>
      </form>
    </div>
  );
};

export default UpdateEmployee;
