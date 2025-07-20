const express = require("express");
const {connectToMongoDB} = require('./connect');
const URL = require('./modules/url');
const path = require("path");
const cookieParser = require('cookie-parser');
const {restrictToLoggedUserOnly, checkAuth} = require('./middlewares/auth')


const urlRoute = require("./routes/url");
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user')


const app = express()
const PORT = 5000;

// short-url is databasename
connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => console.log('database connect'));

// server side rendering
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// middleware   support json data
app.use(express.json());
// middleware   support form data
app.use(express.urlencoded({extended : false}))
// middleware support cookies
app.use(cookieParser())


app.use("/url", restrictToLoggedUserOnly, urlRoute);
app.use("/",checkAuth, staticRoute);
app.use("/user", userRoute);


app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
  const entry =  await URL.findOneAndUpdate(
        {
        shortId,
        },
        {
            $push : {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );
    // res.redirect(entry.redirectURL)
})

app.listen(PORT,() => {
    console.log(`Server Started at PORT: ${PORT}`);
})

// npm i ejs 