$(function(){
	
	module('multiselectable')
	
	/* helpers */
	var list_str = '<ul><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>'
	function getList(){ return $(list_str) }
	function getMultiselectableList(){ return getList().multiselectable() }
	function getMultiselectableListWithChildren(){
		var list = getMultiselectableList()
		list.find('li').first().append('<li class="child"></li>')
		return list
	}
	
	function getMouseDownEvent(parameters){
		return $.extend(jQuery.Event('mousedown'), parameters || {})
	}
	function getShiftMouseDownEvent(){
		return getMouseDownEvent({shiftKey: true})
	}
	function getCtrlMouseDownEvent(){
		return getMouseDownEvent({ctrlKey: true})
	}
	function getMetaMouseDownEvent(){
		return getMouseDownEvent({metaKey: true})
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
		var item = getMultiselectableList().find('li').first().trigger(getMouseDownEvent());
		ok(item.hasClass($.fn.multiselectable.defaults.selectedClass), 'selected has default selected class')
		// this is sort of in repetiion with the `isSelected` helper, but it feels right to explicitly test it
	})
	
	test('selected should have custom selected class', function(){
		var klass = 'grouped'
		var item = getList().multiselectable({selectedClass: klass}).find('li').first().trigger(getMouseDownEvent());
		ok(item.hasClass(klass), 'selected has custom selected class')
	})

	test('given mousedown callback should not be invoked on mousedown', function(){
		expect(1)
		getList().multiselectable({
			mousedown: function(){ ok(true, 'mousedown triggered') }
		}).find('li').first().trigger(getMouseDownEvent());
	})

	test('given click callback should not be invoked on mousedown', function(){
		expect(0)
		getList().multiselectable({
			click: function(){ ok(true, 'click triggered') }
		}).find('li').first().trigger(getMouseDownEvent());
	})

	test('given click callback should be invoked on click', function(){
		expect(1)
		getList().multiselectable({
			click: function(){ ok(true, 'click triggered') }
		}).find('li').first().click();
	})

	test('data-multiselectable attribute should be set on items container', function(){
		var items = getMultiselectableList()
		expect(items.length)
		ok(items.data('multiselectable'), 'data-multiselectable attribute is set')
	})
	
	test('should select unselected item when clicked with no modifiers', function(){
		var item = getMultiselectableList().find('li').first().trigger(getMouseDownEvent());
		ok(isSelected(item), 'item is selected')
	})
	
	test('should unselect selected siblings when clicked with no modifiers', function(){
		expect(2)
		var list = getMultiselectableList()
		var selected = list.find('li:last-child').trigger(getMouseDownEvent())
		list.find('li').first().trigger(getMouseDownEvent())
		
		ok(list.find('li').length > 1, 'list has more than one child')
		ok(!isSelected(selected), 'previously selected item is no longer selected')
	})
	
	test('should select all items from last selected to clicked when clicked with shift modifier', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		expect(items.length)
		
		items.first().trigger(getMouseDownEvent())
		items.last().trigger(getShiftMouseDownEvent())
		
		items.each(function(){
			ok(isSelected($(this)), 'all items selected')
		})
	})

	// Abstracted test into function to keep tests DRY
	function do_shift_select_range_ctrl_meta_click_test(e){
		// We have to duplicate event for second click.
		var e2 = jQuery.extend(true, {}, e);

		var items = getMultiselectableList().find('li')
		items.eq(0).trigger(getMouseDownEvent())

		items.eq(2).trigger(e)
		items.eq(3).trigger(getShiftMouseDownEvent())
		
		items.eq(5).trigger(e2)
		items.eq(6).trigger(getShiftMouseDownEvent())

		ok(isSelected(items.eq(0)), '1 item is selected (click)')
		ok(!isSelected(items.eq(1)), '2 item is not selected')
		ok(isSelected(items.eq(2)), '3 item is selected (ctrl/meta)')
		ok(isSelected(items.eq(3)), '4 item is selected (szhift)')
		ok(!isSelected(items.eq(4)), '5 item is not selected')
		ok(isSelected(items.eq(5)), '6 item is selected (ctrl/meta)')
		ok(isSelected(items.eq(6)), '7 item is selected (shift)')
	}

	test('shift select range should start from last ctrl click', function(){
		do_shift_select_range_ctrl_meta_click_test(getCtrlMouseDownEvent())
	})

	test('shift select range should start from last meta click', function(){
		do_shift_select_range_ctrl_meta_click_test(getMetaMouseDownEvent())
	})

	test('should selected select all items when shift clicked last item and there is no previous selection', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		items.last().trigger(getShiftMouseDownEvent())
		
		expect(items.length)
		
		items.each(function(){
			ok(isSelected($(this)), 'all items are selected')
		})
	})
	
	test('shift selection range can be reduced on following shift select within the selected range', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		
		var first = items.eq(0).trigger(getMouseDownEvent())
		var third = items.eq(2).trigger(getShiftMouseDownEvent())
		var second = items.eq(1).trigger(getShiftMouseDownEvent())

		expect(items.length)
		ok(isSelected(first), '1 item is selected')
		ok(isSelected(second), '2 item is selected')

		items.not(first).not(second).each(function(){
			ok(!isSelected($(this)), 'all items are not selected')
		})
	})

	test('shift selection range can be expanded on following shift select within the selected range', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		
		var first = items.eq(0).trigger(getMouseDownEvent())
		var third = items.eq(2).trigger(getShiftMouseDownEvent())
		var fourth = items.eq(3).trigger(getShiftMouseDownEvent())

		expect(items.length)
		items.each(function(i){
			if (i <= 3) {
				ok(isSelected($(this)), (i + 1) + 'item is selected')
			} else {
				ok(!isSelected($(this)), 'all other items are not selected')
			}
		})
	})

	test('shift selection range can be reversed on following shift select above the selected range', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		
		var fourth = items.eq(3).trigger(getMouseDownEvent())
		var sixth = items.eq(5).trigger(getShiftMouseDownEvent())
		var first = items.eq(0).trigger(getShiftMouseDownEvent())

		expect(items.length)
		items.each(function(i){
			if (i <= 3) {
				ok(isSelected($(this)), (i + 1) + 'item is selected')
			} else {
				ok(!isSelected($(this)), 'all other items are not selected')
			}
		})
	})

	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_unselect_last_item_test(e){
		var items = getMultiselectableList().find('li')
		var first = items.first().trigger(getMouseDownEvent()).trigger(e)
		var others = items.not(first)
		
		expect(others.length + 1)
		ok(!isSelected(first), 'item is no longer selected')
		others.each(function(){
			ok(!isSelected($(this)), 'item is not selected')
		})
	}

	test('should unselect last selected item only when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselect_last_item_test(getCtrlMouseDownEvent())
	})

	test('should unselect last selected item only when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselect_last_item_test(getMetaMouseDownEvent())
	})

	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_unselected_test(e){
		expect(2)
		
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().trigger(getMouseDownEvent())
		var last = items.last().trigger(e)
		
		ok(isSelected(first), 'first item is selected')
		ok(isSelected(last), 'last item is selected')
	}
	
	test('should select unselected self in addition to selected when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselected_test(getCtrlMouseDownEvent())
	})
	
	test('should select unselected self in addition to selected when clicked with meta modifier', function(){
		do_ctrl_meta_click_unselected_test(getMetaMouseDownEvent())
	})
	
	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_selected_test(e){
		expect(2)
		
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().trigger(getMouseDownEvent())
		var last = items.last().trigger(e).trigger(e)
		
		ok(isSelected(first), 'first item is selected')
		ok(!isSelected(last), 'last item is not selected')
	}
	
	test('should unselect selected self but leave others selected when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_selected_test(getCtrlMouseDownEvent())
	})
	
	test('should unselect selected self but leave others selected when clicked with meta modifier', function(){
		do_ctrl_meta_click_selected_test(getMetaMouseDownEvent())
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
		do_ctrl_meta_click_unselected_with_children_test(getCtrlMouseDownEvent())
	})
	
	test('should select unselected self and all immediately following children when clicked with meta modifier', function(){
		do_ctrl_meta_click_unselected_with_children_test(getMetaMouseDownEvent())
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
		do_ctrl_meta_click_selected_with_children_test(getCtrlMouseDownEvent())
	})
	
	test('should unselect selected self and all immediately following children when clicked with meta modifier', function(){
		do_ctrl_meta_click_selected_with_children_test(getMetaMouseDownEvent())
	})

	// Abstracted test into function to keep tests DRY
	function do_click_on_ctrl_meta_shift_click__selected_test(e){
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().trigger(getMouseDownEvent())
		var last = items.last().trigger(getShiftMouseDownEvent())
		var first = items.first().click()

		expect(items.length)
		ok(isSelected(first), 'first item is selected')
		items.not(first).each(function(){
			ok(!isSelected($(this)), 'all other items are not selected')
		})
	}

	test('should select only self if clicked on one of the ctrl selected items', function(){
		do_click_on_ctrl_meta_shift_click__selected_test(getCtrlMouseDownEvent())
	})

	test('should select only self if clicked on one of the meta selected items', function(){
		do_click_on_ctrl_meta_shift_click__selected_test(getMetaMouseDownEvent())
	})

	test('should select only self if clicked on one of the shift selected items', function(){
		do_click_on_ctrl_meta_shift_click__selected_test(getShiftMouseDownEvent())
	})
})
