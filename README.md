# backbone-parse

backbone-parse overrides the Backbone.Sync method to automatically persist your backbone models on Parse using their REST API. Saving you from all the manual plumbing.

# Installation

## Direct download

### Step 1:

Download backbone-parse.js and include it in your application after backbone.js e.g.
```html
<script src="backbone-min.js"></script>
<script src="backbone-parse.js"></script>
```


### Step 2:
Open backbone-parse.js and replace following at the top with your Parse credentials:

```javascript
var appId = "myApp";
var serverURL = "http://localhost:1337/parse";

```

# How to use it:

### Initialization:
Create a Backbone model and set the parse class name:

```javascript
var Item = Backbone.Model.extend({
	_parse_class_name: "Item"
});
```

Create instances of the model as you usually would with Backbone.js

```javascript
var item1 = new Item();
```

Similarly for Collections:

```javascript
var ItemsCollection = Backbone.Collection.extend({
	_parse_class_name: "Item",
	model: Item
});
var itemsCollection = new ItemsCollection();
```

This class name will specify backbone-parse which class persists this model on the Parse server. It is case sensitive. If the class doesn't already exists, Parse will automatically create one.

If the class name is not specified, then the model will be persisted using the default Backbone Sync (i.e. you'll need to specify a url)

### Querying
Parse provides an API to query your data.

backbone-parse provides an easier method for specifying query constraints*. All you need is to pass the constraints in ```fetch``` method of ```Backbone.Collection```. e.g.

```javascript
var ItemCollection = new Backbone.Collection({
	_parse_class_name: "Item"
});

var items = new ItemCollection();
items.fetch({
	query: {"in_stock":true}
});
```
This will fetch all the items which are in stock.
For details about what constraints you can pass, read: https://parse.com/docs/rest#queries

Feedback welcome.

# Developing
You are encouraged to modify and improve the code for your purposes. Fork this repository, clone it locally and you're good to go.

### Tests
If you wish to modify the source, it is highly recommended you set up the testing environment. Dependencies for the testing environment are set up in package.json to use with the node package manager. If you already have node installed just run
`npm install` in the repository's top level directory. Run `npm run test` to start the test runner.

# TODO:

- extend Backbone.Model to tackle Parse User objects


### License

Distributed under [MIT license](http://mutedsolutions.mit-license.org/).

### Uses:

* [testem test runner](https://github.com/testem/testem/)
* [mocha testing framework](https://mochajs.org/)
* [chai assertion library](https://www.chaijs.com/)
* [sinon mocking framework](https://sinonjs.org/)
* [sinon-chai: chai assertions for sinon](https://github.com/domenic/sinon-chai)
-------

*inspired by: http://houseofbilz.com/archives/2011/11/07/making-backbone-js-work-with-parse-com/
