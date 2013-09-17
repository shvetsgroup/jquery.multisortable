# jquery.multisortable [![Build Status](https://travis-ci.org/shvetsgroup/jquery.multisortable.png)](https://travis-ci.org/shvetsgroup/jquery.multisortable)

Extension of [jQuery UI Sortable](http://jqueryui.com/sortable/), which works with multiple selected elements.

## jsFiddle example

http://jsfiddle.net/neochief/KWeMM/

## Usage

```
// simple case
$('ul').multisortable();

// some of the advanced usages
$('div.container').multisortable({
	items: "div.item",
	selectedClass: "selected",
	click: function(e){ console.log("I'm selected."); }
	stop: function(e){ console.log("I've been sorted."); }
});
```

### Changes in API

This plugin provides several new options and events:

#### Options

* **selectedClass**: class which will be assigned to selected items.

#### Events

* **mousedown**: this event will be fired when user starts to drag an item.
* **click**: this event will be fired when user clicks an item.

## Credits

Credit goes to original author of abandoned jquery.multisortable project which can be found at <http://multisortable.110mb.com>.

Jay Hayes, who created a fork for that project on github <https://github.com/iamvery/jquery.multisortable>

All other people, who contributed to the project.