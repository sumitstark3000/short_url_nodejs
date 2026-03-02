const express = require('express');
const urlRoute = require("./routes/url");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedInUser, checkAuth } = require("./middlewares/auth");
const staticRoute = require("./routes/staticrouter");
const URL = require("./models/url");
const userRoute = require("./routes/user");

const app = express();

const PORT = 8001;

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());


connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(() => console.log("Connected to MongoDB"));



app.set("view engine", "ejs");
app.set('views', path.resolve('./views'))


app.use("/url", restrictToLoggedInUser, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get('/url/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now(),
            }
        }
    })
    res.redirect(entry.redirectUrl);

})

app.listen(PORT, () => console.log(`Server is running on PORT : ${PORT}`));