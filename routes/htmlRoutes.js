const db = require("../models")

module.exports = function (app) {
    app.get("/", function (req, res) {
        db.Article.findAll({}).then(function (articles) {
            res.render("index", {
                title: articles
            })

        })
    })
};
