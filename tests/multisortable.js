// custom placeholder
// (text) selection should be disabled


$(function(){
	
	module('multisortable', {teardown: function(){ $('#qunit-fixture').empty() }})
	
	/* helpers */
	var list_str = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
	function getList(){ return $(list_str).appendTo('#qunit-fixture') }
	function getMultisortableList(options){ return getList().multisortable(options) }
	
	function getMultisortableListAndDoDrag(options) {
		var list = getMultisortableList(options)
		list.find('li').first().click().simulate('drag', { dy: 0, dy: 10 })
	}
	function isSelected(item, klass){
		return item.hasClass(klass || $.fn.multiselectable.defaults.selectedClass)
	}
	
	/* tests */
	test('should be defined on jQuery object', function(){
		ok(getList().multisortable, 'multisortable method is defined')
	})
	
	test('should return element', function(){
		var list = getList()
		ok(list.multisortable() == list, 'list returned')
	})
	
	test('should expose defaults var for settings', function(){
		ok($.fn.multisortable.defaults, 'default object exposed')
	})
	
	test('should use custom placeholder class', function(){
		var placeholder = 'the-place-that-holds'
		var list = getMultisortableListAndDoDrag({
			placeholder: placeholder,
			start: function(e, ui){
				ok(ui.placeholder.hasClass(placeholder), 'placeholder has custom class')
			}
		})
	})
	
	test('custom start, stop, sort, and click callbacks should be invoked', function(){
		expect(4)
		var start, stop, sort, click
		getMultisortableListAndDoDrag({
			start: 	 function(e, ui){ start = ui },
			stop: 	 function(e, ui){ stop = ui },
			sort: 	 function(e, ui){ sort = ui },
			click: 	 function(e, ui){ click = ui }
		})
		
		ok(start, "sortable started")
		ok(stop, "sortable stopped")
		ok(sort, "sortable sorted")
		ok(click, "sortable clicked")
	})
	
	test('TODO: custom receive callback should be invoked', function(){
		ok(true, "missing test - I don't currently know a way to simulate a `receive` event")
	})
	
	test('should allow unselected items to be sorted', function(){
		// can't use `getMultisortableListAndDoDrag` helper here because we don't want to have an item selected during the drag simulation
		var sort
		var list = getList().multisortable({
			sort: function(e, ui){ sort = ui }
		})
		
		var first = list.find('li').first();
		first.simulate('drag', { dy: 0, dy: 10 })
		
		ok(sort, "unselected item should not be sorted")
		ok(isSelected(first), 'dragged item is selected')
	})
	
	test('when started, indices should be assigned to all selected items', function(){
		getMultisortableListAndDoDrag({
			start: function(e, ui){
				ui.item.parent().find('.' + $.fn.multiselectable.defaults.selectedClass).each(function(){
					notEqual($(this).data('i'), undefined, 'selected item should have index defined')
				})
			}
		})
	})
	
	test('when started, placeholder height should be adjusted to match the combined height of all selected items', function(){
		var list = getMultisortableList({
			placeholder: 'testing',
			start: function(e, ui){
				var height = 0
				ui.item.parent().find('.' + $.fn.multiselectable.defaults.selectedClass).each(function(){
					height += $(this).outerHeight()
				})
				
				equal(ui.placeholder.height(), height, 'placeholder height should match combined selected items')
			}
		})
		
		list.find('li').addClass($.fn.multiselectable.defaults.selectedClass)
		list.find('li').first().simulate('drag', { dx: 0, dy: 10 })
	})
	
	test('TODO: when stopped, all selected items should be regrouped to their appropriate positions "around" the dragged item', function(){
		ok(true, "missing test - not 100% sure how to test this; I'm pretty sure they item order would actually have to change for this to be meaningful...")
	})
	
	test('when sorted, items "around" the dragged item should position themselves absolutely relative to the dragged item', function(){
		var list = getList()
		var items = list.find('li')
		var first = items.first().addClass($.fn.multiselectable.defaults.selectedClass)
		var second = items.eq(1).addClass($.fn.multiselectable.defaults.selectedClass)
		var third = items.eq(2).addClass($.fn.multiselectable.defaults.selectedClass)
		
		list.multisortable({
			sort: function(e, ui){
				var left = second.css('left'),
					top = parseInt(second.css('top').replace('px', ''))
					
				ok(first.css('position'), 'prev has absolute position')
				ok(third.css('position'), 'prev has absolute position')
				equal(first.css('left'), left, 'prev has same left position as dragged')
				equal(third.css('left'), left, 'next has same left position as dragged')
				equal(first.css('top'), top - first.outerHeight() + 'px', 'prev is positioned its height above dragged' )
				equal(third.css('top'), top + second.outerHeight() + 'px', 'next is positioned dragged height below dragged')
			}
		})
		
		second.simulate('drag', { dx: 0, dy: 10})
	})
	
	test('TODO: when received by a connected list, items should be regrouped to their appropriate position "around" dragged item', function(){
		ok(true, "missing test - I don't currently know a way to simulate a `receive` event")
	})
	
	test('can make empty list multisortable', function(){
		expect(0)
		$('<ul></ul>').multisortable()
	})
	
})
