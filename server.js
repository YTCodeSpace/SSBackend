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
const port = process.env.PORT || 3001;
let userName;

app.listen(port, () => {
  console.log("connected to 3001");
});

//Middlewares
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true, // Allow cookies to be sent
  })
);
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

Routes;
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
    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
    res.cookie("authToken", token, {
      httpOnly: true, // Secure against XSS
      secure: false, // Set to true in production with HTTPS
      sameSite: "Strict", // Prevent CSRF
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    userName = username;
  } catch (error) {
    res.status(500).json({ error: "Error Logging in" });
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Access granted" });
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
