const express = require("express");
const cors = require('cors');
const userRouter = require("./router/userRouter");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require('path');
const friendRouter = require("./router/friendRouter");
const contentRouter = require("./router/contentRouter");
const messagerieRouter = require("./router/messagerieRouter");
const bodyParser = require("body-parser");
const collaborationRouter = require("./router/collaborationRouter");
dotenv.config();

const app = express();


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use(userRouter);
app.use(friendRouter);
app.use(contentRouter);
app.use(collaborationRouter)
app.use(messagerieRouter);
const HOST = process.env.HOST || '0.0.0.0';


app.listen(process.env.PORT, HOST,() => {
    console.log("Application en cours d'éxecution !");
});
