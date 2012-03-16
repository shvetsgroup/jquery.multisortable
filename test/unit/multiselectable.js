$(function(){
	
	module('multiselectable')
	
	/* helpers */
	var list_str = '<ul><li></li><li></li><li></li></ul>'
	function getList(){ return $(list_str) }
	function getMultiselectableList(){ return getList().multiselectable() }
	function getMultiselectableListWithChildren(){
		var list = getMultiselectableList()
		list.find('li').first().append('<li class="child"></li>')
		return list
	}
	
	function getClickEvent(parameters){
		return $.extend(jQuery.Event('click'), parameters || {})
	}
	function getShiftClickEvent(){
		return getClickEvent({shiftKey: true})
	}
	function getCtrlClickEvent(){
		return getClickEvent({ctrlKey: true})
	}
	function getMetaClickEvent(){
		return getClickEvent({metaKey: true})
	}
	
	function isSelected(item, klass){
		return item.hasClass(klass || $.fn.multiselectable.defaults.selectedClass)
	}
	
	
	/* tests */
	test('should be defined on jQuery object', function(){
		ok(getList().multiselectable, 'multiselectable method is defined')
	})
	
	test('should return element', function(){
		var list = getList()
		ok(list.multiselectable() == list, 'list returned')
	})
	
	test('should expose defaults var for settings', function(){
		ok($.fn.multiselectable.defaults, 'default object exposed')
	})
	
	test('selected should have default selected class', function(){
		var item = getMultiselectableList().find('li').first().click()
		ok(item.hasClass($.fn.multiselectable.defaults.selectedClass), 'selected has default selected class')
		// this is sort of in repetiion with the `isSelected` helper, but it feels right to explicitly test it
	})
	
	test('selected should have custom selected class', function(){
		var klass = 'grouped'
		var item = getList().multiselectable({selectedClass: klass}).find('li').first().click()
		ok(item.hasClass(klass), 'selected has custom selected class')
	})
	
	test('given click callback should be invoked', function(){
		expect(1)
		getList().multiselectable({
			click: function(){ ok(true, 'click triggered') }
		}).find('li').first().click()
	})
	
	test('data-multiselectable attribute should be set on all items', function(){
		var items = getMultiselectableList().find('li')
		expect(items.length)
		items.each(function(){
			ok($(this).data('multiselectable'), 'data-multiselectable attribute is truthy')
		})
	})
	
	test('should select unselected item when clicked with no modifiers', function(){
		var item = getMultiselectableList().find('li').first().click()
		ok(isSelected(item), 'item is selected')
	})
	
	test('should unselect selected siblings when clicked with no modifiers', function(){
		expect(2)
		var list = getMultiselectableList()
		var selected = list.find('li:last-child').click()
		list.find('li').first().click()
		
		ok(list.find('li').length > 1, 'list has more than one child')
		ok(!isSelected(selected), 'previously selected item is no longer selected')
	})
	
	test('should select all items from last selected to clicked when clicked with shift modifier', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		expect(items.length)
		
		items.first().click()
		items.last().trigger(getShiftClickEvent())
		
		items.each(function(){
			ok(isSelected($(this)), 'all items selected')
		})
	})
	
	test('should selected unselected item only when clicked with shift modifier and there is no previous selection', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		var item = items.first().trigger(getShiftClickEvent())
		
		expect(items.length)
		
		ok(isSelected(item), 'shift clicked item is selected')
		
		items.not(item).each(function(){
			ok(!isSelected($(this)), 'other item is not selected')
		})
	})
	
	test('should unselect last selected item only when clicked with shift modifier', function(){
		var items = getMultiselectableList().find('li')
		var first = items.first().click().trigger(getShiftClickEvent())
		var others = items.not(first)
		
		expect(others.length + 1)
		ok(!isSelected(first), 'item is no longer selected')
		others.each(function(){
			ok(!isSelected($(this)), 'item is not selected')
		})
	})
	
	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_unselected_test(e){
		expect(2)
		
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().click()
		var last = items.last().trigger(e)
		
		ok(isSelected(first), 'first item is selected')
		ok(isSelected(last), 'last item is selected')
	}
	
	test('should select unselected self in addition to selected when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselected_test(getCtrlClickEvent())
	})
	
	test('should select unselected self in addition to selected when clicked with meta modifier', function(){
		do_ctrl_meta_click_unselected_test(getMetaClickEvent())
	})
	
	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_selected_test(e){
		expect(2)
		
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().click()
		var last = items.last().trigger(e).trigger(e)
		
		ok(isSelected(first), 'first item is selected')
		ok(!isSelected(last), 'last item is not selected')
	}
	
	test('should unselect selected self but leave others selected when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_selected_test(getCtrlClickEvent())
	})
	
	test('should unselect selected self but leave others selected when clicked with meta modifier', function(){
		do_ctrl_meta_click_selected_test(getMetaClickEvent())
	})
	
	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_unselected_with_children_test(e){
		var list = getMultiselectableListWithChildren()
		var items = list.find('li')
		var first = items.first().trigger(e)
		var children = first.nextUntil(':not(.child)')
		
		expect(children.length + 1)
		
		ok(isSelected(first), 'first item is selected')
		children.each(function(){
			ok(isSelected($(item)), 'child is selected')
		})
	}
	
	test('should select unselected self and all immediately following children when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselected_with_children_test(getCtrlClickEvent())
	})
	
	test('should select unselected self and all immediately following children when clicked with meta modifier', function(){
		do_ctrl_meta_click_unselected_with_children_test(getMetaClickEvent())
	})
	
	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_selected_with_children_test(e){
		var list = getMultiselectableListWithChildren()
		var items = list.find('li')
		var first = items.first().trigger(e).trigger(e)
		var children = first.nextUntil(':not(.child)')
		
		expect(children.length + 1)
		
		ok(!isSelected(first), 'first item is selected')
		children.each(function(){
			ok(!isSelected($(item)), 'child is selected')
		})
	}
	
	test('should unselect selected self and all immediately following children when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_selected_with_children_test(getCtrlClickEvent())
	})
	
	test('should unselect selected self and all immediately following children when clicked with meta modifier', function(){
		do_ctrl_meta_click_selected_with_children_test(getMetaClickEvent())
	})
	
})
