// pages/api/socket.js
import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Mock database of employees and students
const database = [
  {
    department: 1,
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "123-456-7890",
    email: "john.doe@cst.edu",
  },
  {
    department: 1,
    firstName: "Jane",
    lastName: "Smith",
    phoneNumber: "123-456-7891",
    email: "jane.smith@cst.edu",
  },
  {
    department: 2,
    firstName: "Robert",
    lastName: "Johnson",
    phoneNumber: "123-456-7892",
    email: "robert.johnson@cst.edu",
  },
  {
    department: 2,
    firstName: "Emily",
    lastName: "Williams",
    phoneNumber: "123-456-7893",
    email: "emily.williams@cst.edu",
  },
  {
    department: 3,
    firstName: "Michael",
    lastName: "Brown",
    phoneNumber: "123-456-7894",
    email: "michael.brown@cst.edu",
  },
  {
    department: 3,
    firstName: "Sarah",
    lastName: "Davis",
    phoneNumber: "123-456-7895",
    email: "sarah.davis@cst.edu",
  },
  {
    department: 1,
    firstName: "David",
    lastName: "Miller",
    phoneNumber: "123-456-7896",
    email: "david.miller@cst.edu",
  },
  {
    department: 2,
    firstName: "Lisa",
    lastName: "Wilson",
    phoneNumber: "123-456-7897",
    email: "lisa.wilson@cst.edu",
  },
];

// Function to find employee/student by first name and last name
const findByName = (firstName, lastName) => {
  return database.find(
    (person) =>
      person.firstName.toLowerCase() === firstName.toLowerCase() &&
      person.lastName.toLowerCase() === lastName.toLowerCase()
  );
};

// Function to find employee/student by last name and department
const findByLastNameAndDept = (lastName, deptNumber) => {
  return database.find(
    (person) =>
      person.lastName.toLowerCase() === lastName.toLowerCase() &&
      person.department === parseInt(deptNumber)
  );
};

// Function to get all employees/students in a department
const getByDepartment = (deptNumber) => {
  return database.filter(
    (person) => person.department === parseInt(deptNumber)
  );
};

const SocketHandler = (req, res) => {
  if (req.method !== "GET") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  if (!res.socket.server.io) {
    console.log("Setting up socket server");
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("requestEmail", (data) => {
        console.log("Email request received:", data);
        let person =
          findByName(data.firstName, data.lastName) ||
          findByLastNameAndDept(data.lastName, data.deptNumber);
        if (person) {
          socket.emit("emailResponse", { success: true, email: person.email });
        } else {
          socket.emit("emailResponse", {
            success: false,
            message: "Person not found in database",
          });
        }
      });

      socket.on("requestPhone", (data) => {
        console.log("Phone request received:", data);
        let person =
          findByName(data.firstName, data.lastName) ||
          findByLastNameAndDept(data.lastName, data.deptNumber);
        if (person) {
          socket.emit("phoneResponse", {
            success: true,
            phoneNumber: person.phoneNumber,
          });
        } else {
          socket.emit("phoneResponse", {
            success: false,
            message: "Person not found in database",
          });
        }
      });

      socket.on("requestDepartmentList", (data) => {
        console.log("Department list request received:", data);
        const people = getByDepartment(data.deptNumber);
        if (people.length > 0) {
          socket.emit("departmentListResponse", { success: true, people });
        } else {
          socket.emit("departmentListResponse", {
            success: false,
            message: "No people found in this department",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  } else {
    console.log("Socket server already running");
  }

  res.end(); // required to avoid hanging
};

export default SocketHandler;

// Note: The "getAllData" export is left as-is
export function getAllData() {
  return database;
}
