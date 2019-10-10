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
    // First, we grab the body of the html with axios
    axios.get("https://www.nasa.gov/content/science-mission-directorate-press-releases").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".ubernode").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("h3")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (article) {
            res.json(article);
        })
        .catch(function (err) {
            res.json(err)
        })
    // TODO: Finish the route so it grabs all of the articles
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    db.Article.find({ _id: req.params.id }).populate("note")
        .then(function (id) {
            res.json(id)
        })
        .catch(function (err) {
            res.json(err)
        })
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
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

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
