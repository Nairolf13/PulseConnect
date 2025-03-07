const express = require("express");
const cors = require("cors");
const userRouter = require("./router/userRouter");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const friendRouter = require("./router/friendRouter");
const contentRouter = require("./router/contentRouter");
const messagerieRouter = require("./router/messagerieRouter");
const bodyParser = require("body-parser");
const collaborationRouter = require("./router/collaborationRouter");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'https://pulseconnect.duckdns.org', 
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


app.get("/cookies/preferences", (req, res) => {
  res.json({
    analytics: req.cookies.analytics === "true",
    marketing: req.cookies.marketing === "true",
  });
});

app.post("/cookies/preferences", (req, res) => {
  const { analytics, marketing } = req.body;

  res.cookie("analytics", analytics, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.cookie("marketing", marketing, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.json({ message: "Préférences enregistrées !" });
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "sitemap.xml"));
});

app.use(userRouter);
app.use(friendRouter);
app.use(contentRouter);
app.use(collaborationRouter);
app.use(messagerieRouter);

const HOST = process.env.HOST || "0.0.0.0";

app.listen(process.env.PORT, HOST, () => {
  console.log("Application en cours d'exécution !");
});
