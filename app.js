const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("http");
const _ = require("lodash");
const multer = require("multer");
require("dotenv").config();
const mongoose = require("mongoose");
const res = require("express/lib/response");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// console.log(process.env);
mongoose.connect(process.env.MONGOD_URL);
//storage for the upload
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/uploads/files");
  },
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
// upload parameter for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

const postSchema = {
  title: String,
  content: String,
  file: String,
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        posts: foundPosts,
      });
    }
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

// Create Post
app.post("/compose", upload.single("myfile"), function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.blog,
    file: req.file.filename,
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

// Read Post
app.get("/posts/:postId", function (req, res) {
  let requestedPostId = req.params.postId;
  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
      postId: post._id,
      file: post.file,
    });
  });
});

//For Editing the post
app.get("/posts/:postId/edit", (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { post: post });
    }
  });
});
app.post("/posts/:postId/edit", upload.single("myfile"), (req, res) => {
  Post.findByIdAndUpdate(
    req.params.postId,
    {
      $set: {
        title: req.body.title,
        content: req.body.content,
        file: req.file.filename,
      },
    },
    (err, update) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Post Updated");
        res.redirect("/");
      }
    }
  );
});

//For Deleting the post
app.post("/posts/:postId/delete", function (req, res) {
  Post.deleteOne({ _id: req.params.postId }, function (err) {
    if (err) {
      res.send(err);
    } else {
      console.log("SuccesFully Deleted this Post");
      res.redirect("/");
    }
  });
});
//Listening the port Locally or heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started successfully");
});
