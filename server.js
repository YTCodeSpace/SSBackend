const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/userSchema");
const { MongoClient } = require("mongodb");
const SECRET_KEY = "RSA_SECRET_KEY_995356_9111477_AR";
const dotenv = require("dotenv");
dotenv.config();
// connect to express app
const app = express();
const port = Number(process.env.PORT) || 3001;
let userName;

app.listen(port, () => {
  console.log("connected to 3001");
});

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://main.d1kpt9kcduvwie.amplifyapp.com",
];
// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true, // Allow cookies to be sent
//   })
// );

const corsOrigin = {
  origin: allowedOrigins,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOrigin));

// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization"
//     );
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//   }

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

app.get("/data", authenticateToken, async (req, res) => {
  const client = new MongoClient(process.env.MONGO_URI_MACHINES);
  let con1;
  try {
    con1 = await client.connect();
    let db = con1.db(userName);
    let collection = db.collection("data");
    const data = await collection.find().toArray();
    res.send(data).status(200);
  } catch (e) {
    console.error(e);
  }
});

app.post("/register", async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URI_AUTH);
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URI_AUTH);
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    }); // Set `secure: true` in production with HTTPS
    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Error Logging in" });
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.get("/home", (req, res) => {
  let db;
  let dataCollection1;
  MongoClient.connect(
    process.env.MONGO_URI_DATA,
    // { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) {
        throw error;
      }
      db = client.db("SmartSolution");
      dataCollection1 = db.collection("Heunert");
    }
  );
  let homeresult = "";
  homeresult = collection1
    .aggregate([
      {
        $project: {
          L1_activ: 1,
          L2_activ: 1,
          L3_activ: 1,
          L1_ist: 1,
          L2_ist: 1,
          L3_ist: 1,
          L1_soll: 1,
          L2_soll: 1,
          L3_soll: 1,
          L1_length: 1,
          L2_length: 1,
          L3_length: 1,
          L1_time: 1,
          L2_time: 1,
          L3_time: 1,
          L1_pr: 1,
          L2_pr: 1,
          L3_pr: 1,
          saw_dm: 1,
          saw_manu: 1,
          saw_teeth: 1,
          saw_typ: 1,
          saw_width: 1,
          mat_dm: 1,
          mat_length: 1,
          mat_thick: 1,
          mat_typ: 1,
          mat_width: 1,
          headcut: 1,
          reststueck: 1,
          deburring: 1,
          rasagrip: 1,
          tube_light: 1,
          jobId: 1,
          busy: 1,
          busy_waiting: 1,
          standby: 1,
          error: 1,
          feedSpeed: 1,
          vBeltSpeed: 1,
          planSpeed: 1,
          cutPower: 1,
          cutPowerMax: 1,
          cutMoveTime: 1,
          sawLife: 1,
          burshOutside: 1,
          burshF: 1,
          burshL: 1,
          totalHour: 1,
          totalCutted: 1,
          dateTime: 1,
          _id: 1,
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ])
    .toArray();
  res.send(homeresult).status(200);
});
