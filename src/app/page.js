"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import styles from "../styles/Home.module.css";

// Reusable components
const RequestForm = ({ title, onSubmit, fields, buttonText }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.requestForm}>
      <h3>{title}</h3>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name} className={styles.formField}>
            <label htmlFor={field.name} className="text-white">
              {field.label}:
            </label>
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              required={field.required}
            />
          </div>
        ))}
        <button type="submit" className={styles.submitButton}>
          {buttonText}
        </button>
      </form>
    </div>
  );
};

// Main component
export default function Home() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [emailResponse, setEmailResponse] = useState(null);
  const [phoneResponse, setPhoneResponse] = useState(null);
  const [departmentResponse, setDepartmentResponse] = useState(null);
  const [requestMethod, setRequestMethod] = useState("byName");

  useEffect(() => {
    console.log("initializing socket connection");
    const initSocket = async () => {
      // First, fetch the API to initialize the socket server
      // await fetch("/api/socket");

      // Then connect with the correct path configuration
      const newSocket = io({
        // path: "/api/socket_io",
        // transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      console.log("socket initialized:", newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to server with ID:", newSocket.id);
        setConnected(true);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Connection errorsssssss:", err);
      });

      newSocket.on("emailResponse", (data) => {
        console.log("Email response:", data);
        setEmailResponse(data);
      });

      newSocket.on("phoneResponse", (data) => {
        console.log("Phone response:", data);
        setPhoneResponse(data);
      });

      newSocket.on("departmentListResponse", (data) => {
        console.log("Department list response:", data);
        setDepartmentResponse(data);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setConnected(false);
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      };
    };

    initSocket();
  }, []);

  const requestEmail = (data) => {
    if (socket) {
      console.log("Requesting email for:", data);
      socket.emit("requestEmail", data);
    }
  };

  const requestPhone = (data) => {
    if (socket) {
      console.log("Requesting phone for:", data);
      socket.emit("requestPhone", data);
    }
  };

  const requestDepartmentList = (data) => {
    if (socket) {
      console.log(
        "Requesting department list for department:",
        data.deptNumber
      );
      socket.emit("requestDepartmentList", data);
    }
  };

  const getNameFields = () => [
    { name: "firstName", label: "First Name", required: true },
    { name: "lastName", label: "Last Name", required: true },
  ];

  const getDeptAndNameFields = () => [
    { name: "lastName", label: "Last Name", required: true },
    { name: "deptNumber", label: "Department Number", required: true },
  ];

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>CST School Information System</h1>

        <div className={`${styles.connectionStatus} `}>
          Status: {connected ? "Connected to server" : "Not connected"}
        </div>

        <div className={`${styles.requestOptions} text-white`}>
          <div className={styles.toggleMethod}>
            <span>Search method: </span>
            <label>
              <input
                type="radio"
                value="byName"
                checked={requestMethod === "byName"}
                onChange={() => setRequestMethod("byName")}
              />
              By Full Name
            </label>
            <label>
              <input
                type="radio"
                value="byDeptAndName"
                checked={requestMethod === "byDeptAndName"}
                onChange={() => setRequestMethod("byDeptAndName")}
              />
              By Last Name & Department
            </label>
          </div>
        </div>

        <div className={styles.requestForms}>
          <RequestForm
            title="Request Email Address"
            onSubmit={requestEmail}
            fields={
              requestMethod === "byName"
                ? getNameFields()
                : getDeptAndNameFields()
            }
            buttonText="Get Email"
          />

          <RequestForm
            title="Request Phone Number"
            onSubmit={requestPhone}
            fields={
              requestMethod === "byName"
                ? getNameFields()
                : getDeptAndNameFields()
            }
            buttonText="Get Phone"
          />

          <RequestForm
            title="List Department Members"
            onSubmit={requestDepartmentList}
            fields={[
              {
                name: "deptNumber",
                label: "Department Number",
                required: true,
              },
            ]}
            buttonText="Get List"
          />
        </div>

        <div className={styles.responses}>
          {emailResponse && (
            <div className={styles.responseItem}>
              <h3>Email Request Result:</h3>
              {emailResponse.success ? (
                <p>Email: {emailResponse.email}</p>
              ) : (
                <p className={styles.error}>{emailResponse.message}</p>
              )}
            </div>
          )}

          {phoneResponse && (
            <div className={styles.responseItem}>
              <h3>Phone Request Result:</h3>
              {phoneResponse.success ? (
                <p>Phone: {phoneResponse.phoneNumber}</p>
              ) : (
                <p className={styles.error}>{phoneResponse.message}</p>
              )}
            </div>
          )}

          {departmentResponse && (
            <div className={styles.responseItem}>
              <h3>Department List Result:</h3>
              {departmentResponse.success ? (
                <div>
                  <p>
                    Found {departmentResponse.people.length} people in
                    department:
                  </p>
                  <ul>
                    {departmentResponse.people.map((person, index) => (
                      <li key={index}>
                        {person.firstName} {person.lastName} - {person.email}{" "}
                        (Phone: {person.phoneNumber})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={styles.error}>{departmentResponse.message}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
