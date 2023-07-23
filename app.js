//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-favour:suvrf7RUMKdR!PF@cluster0.uebitdq.mongodb.net/TodolistDB');
  const itemSchema = new mongoose.Schema({
    name: String
  });
  const Item = mongoose.model('Item', itemSchema);

  const item1 = new Item({
    name: 'Welcome to your to do list!'
  });

  const item2 = new Item({
    name: 'Hit the + button to add a new item.'
  });
  
  const item3 = new Item({
    name: '<-- Hit this to delete an item.'
  });

  const defaultItems = [item1, item2, item3];
  const listSchema = {
    name: String,
    items: [itemSchema]
  };
 
  const List = mongoose.model("List", listSchema);


  app.get("/", (req, res) => {
    Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
  .then(() => {
    console.log('Success!');
  })
  .catch((err) => {
    console.log(err);   
  });  
  res.redirect('/'); 
      } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    })
    .catch((err) => {
      console.log(err);
    });
      
    });
    
    app.get('/:customListTitle', (req, res) => {
      const requestedFile = _.capitalize(req.params.customListTitle);

      List.findOne({name: requestedFile}).then((foundList) => {
      if (!foundList) {
        // creates a new list
        const list = new List({
          name: requestedFile,
          items: defaultItems
        });
        list.save();       
        res.redirect('/' + requestedFile);
      } else {
        // show the existing list by rendering the page
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items})
        console.log('found list');
      }
    })
    .catch((err) => {
      console.log(err);   
    });  
    });
    

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === 'Today') {
    newItem.save();
    res.redirect("/");
     
  } else {
 List.findOne({name: listName}).then((foundList) =>{
  foundList.items.push(newItem);
  foundList.save();
  res.redirect('/' + listName);
 });   
  }


});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId).then((err) => {
      if (!err) {
        console.log('deleted');
        res.redirect('/');
          
      } 
    });  
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(() => {
        res.redirect('/' + listName); 
      });
  }
  
});
}

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
