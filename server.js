const express = require("express");
const handlebars = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./models");
const PORT = 3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/scinews", { useNewUrlParser: true });
app.get("/scrape", function (req, res) {

    axios.get("https://www.nasa.gov/content/science-mission-directorate-press-releases").then(function (response) {

        var $ = cheerio.load(response.data);
        $(".ubernode").each(function (i, element) {
            var result = {};
            result.title = $(this)
                .children("h3")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.send("Scrape Complete");
    });
});

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (article) {
            res.json(article);
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.get("/articles/:id", function (req, res) {
    db.Article.find({ _id: req.params.id }).populate("note")
        .then(function (id) {
            res.json(id)
        })
        .catch(function (err) {
            res.json(err)
        })
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbnote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbnote._id }, { new: true })
        })
        .then(function (article) {
            res.json(article)
        })
        .catch(function (err) {
            res.json(err)
        })
})
    ;

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
