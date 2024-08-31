/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useContext, useReducer } from 'react';


const EmployeeContext = createContext();

const employeeReducer = (state, action) => {
  switch (action.type) {
    case 'GET_EMPLOYEES':
      return {
        ...state,
        employees: action.payload,
      };
    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload],
      };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(employee =>
          employee._id === action.payload._id ? action.payload : employee
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(employee => employee._id !== action.payload),
      };
    default:
      return state;
  }
};

export const EmployeesContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(employeeReducer, {
      employees: []
    })
    
    return (
      <EmployeeContext.Provider value={{...state, dispatch}}>
        {children}
      </EmployeeContext.Provider>
    )
  }
  export const useEmployeeContext = () => useContext(EmployeeContext);