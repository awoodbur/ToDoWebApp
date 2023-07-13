//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://aarondwoods:Aralol121d@cluster0.rigbbu4.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item ({
  name: "Do chores"
});
const item2 = new Item ({
  name: "Do work"
});
const item3 = new Item ({
  name: "Do play"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({}).then((results) => {
    if (results.length === 0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }

  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;

  const newItem = new Item({name: itemName});

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName}).then(foundList => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(err => {
      console.log(err);
    });

  }
  //Item.insertMany(newItem);
});

app.post("/delete", function(req, res){
  const listName = req.body.listName;
  const checkedId = req.body.checkbox;

  if (listName === "Today") {
    async function deleteTask(){
      const del = await Item.findByIdAndRemove(checkedId);
    };
    deleteTask();
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}).then(foundList => {
      
      res.redirect("/" + listName);
      
    });
  }


});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName);

  List.findOne({name:listName}).then(foundList => {
    console.log("result: ", foundList);
    if (!foundList) {
      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + listName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(err => {
    console.log(err);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

app.listen(port, function() {
  console.log("Server started");
});
