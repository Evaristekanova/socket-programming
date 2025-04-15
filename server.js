const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Your database and helper functions
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

const findByName = (firstName, lastName) => {
  return database.find(
    (person) =>
      person.firstName.toLowerCase() === firstName.toLowerCase() &&
      person.lastName.toLowerCase() === lastName.toLowerCase()
  );
};

const findByLastNameAndDept = (lastName, deptNumber) => {
  return database.find(
    (person) =>
      person.lastName.toLowerCase() === lastName.toLowerCase() &&
      person.department === parseInt(deptNumber)
  );
};

const getByDepartment = (deptNumber) => {
  return database.filter(
    (person) => person.department === parseInt(deptNumber)
  );
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

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

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
