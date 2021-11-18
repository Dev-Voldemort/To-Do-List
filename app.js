
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
main().catch(err => console.log(err));
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


async function main() {
  await mongoose.connect("mongodb+srv://admin-meet:Test123@todolist.llctn.mongodb.net/todolistDB");
};

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const eat = new Item ({
  name: "Eat"
});
const sleep = new Item ({
  name: "Sleep"
});
const repeat = new Item ({
  name: "Repeat"
});

const defaultItems = [eat, sleep, repeat];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model ("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
        if(foundItems.length === 0) {
          Item.insertMany(defaultItems, function(err) {
            if(err) {
              console.log(err);
            } else {
              console.log("Data inserted successfully!");
            }
          });
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
          }
    });
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        //Create new List
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else {
        //Show an existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkboxItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkboxItemId, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("successfully deleted chacked Item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + listName)
      }
    })
  }
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});
 // "items" must be an nested(embeded) document or an array.
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
