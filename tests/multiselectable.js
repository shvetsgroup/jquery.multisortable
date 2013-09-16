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
	
	function getClickEvent(parameters){
		return $.extend(jQuery.Event('mousedown'), parameters || {})
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
		var item = getMultiselectableList().find('li').first().trigger('mousedown');
		ok(item.hasClass($.fn.multiselectable.defaults.selectedClass), 'selected has default selected class')
		// this is sort of in repetiion with the `isSelected` helper, but it feels right to explicitly test it
	})
	
	test('selected should have custom selected class', function(){
		var klass = 'grouped'
		var item = getList().multiselectable({selectedClass: klass}).find('li').first().trigger('mousedown');
		ok(item.hasClass(klass), 'selected has custom selected class')
	})
	
	test('given click callback should be invoked', function(){
		expect(1)
		getList().multiselectable({
			click: function(){ ok(true, 'click triggered') }
		}).find('li').first().trigger('mousedown');
	})
	
	test('data-multiselectable attribute should be set on items container', function(){
		var items = getMultiselectableList()
		expect(items.length)
		ok(items.data('multiselectable'), 'data-multiselectable attribute is set')
	})
	
	test('should select unselected item when clicked with no modifiers', function(){
		var item = getMultiselectableList().find('li').first().trigger('mousedown');
		ok(isSelected(item), 'item is selected')
	})
	
	test('should unselect selected siblings when clicked with no modifiers', function(){
		expect(2)
		var list = getMultiselectableList()
		var selected = list.find('li:last-child').trigger('mousedown')
		list.find('li').first().trigger('mousedown')
		
		ok(list.find('li').length > 1, 'list has more than one child')
		ok(!isSelected(selected), 'previously selected item is no longer selected')
	})
	
	test('should select all items from last selected to clicked when clicked with shift modifier', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		expect(items.length)
		
		items.first().trigger('mousedown')
		items.last().trigger(getShiftClickEvent())
		
		items.each(function(){
			ok(isSelected($(this)), 'all items selected')
		})
	})

	// Abstracted test into function to keep tests DRY
	function do_shift_select_range_ctrl_meta_click_test(e){
		// We have to duplicate event for second click.
		var e2 = jQuery.extend(true, {}, e);

		var items = getMultiselectableList().find('li')
		items.eq(0).trigger('mousedown')

		items.eq(2).trigger(e)
		items.eq(3).trigger(getShiftClickEvent())
		
		items.eq(5).trigger(e2)
		items.eq(6).trigger(getShiftClickEvent())

		ok(isSelected(items.eq(0)), '1 item is selected (click)')
		ok(!isSelected(items.eq(1)), '2 item is not selected')
		ok(isSelected(items.eq(2)), '3 item is selected (ctrl/meta)')
		ok(isSelected(items.eq(3)), '4 item is selected (szhift)')
		ok(!isSelected(items.eq(4)), '5 item is not selected')
		ok(isSelected(items.eq(5)), '6 item is selected (ctrl/meta)')
		ok(isSelected(items.eq(6)), '7 item is selected (shift)')
	}

	test('shift select range should start from last ctrl click', function(){
		do_shift_select_range_ctrl_meta_click_test(getCtrlClickEvent())
	})

	test('shift select range should start from last meta click', function(){
		do_shift_select_range_ctrl_meta_click_test(getMetaClickEvent())
	})

	test('should selected select all items when shift clicked last item and there is no previous selection', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		items.last().trigger(getShiftClickEvent())
		
		expect(items.length)
		
		items.each(function(){
			ok(isSelected($(this)), 'all items are selected')
		})
	})
	
	test('shift selection range can be reduced on following shift select within the selected range', function(){
		var list = getMultiselectableList()
		var items = list.find('li')
		
		var first = items.eq(0).trigger('mousedown')
		var third = items.eq(2).trigger(getShiftClickEvent())
		var second = items.eq(1).trigger(getShiftClickEvent())

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
		
		var first = items.eq(0).trigger('mousedown')
		var third = items.eq(2).trigger(getShiftClickEvent())
		var fourth = items.eq(3).trigger(getShiftClickEvent())

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
		
		var fourth = items.eq(3).trigger('mousedown')
		var sixth = items.eq(5).trigger(getShiftClickEvent())
		var first = items.eq(0).trigger(getShiftClickEvent())

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
		var first = items.first().trigger('mousedown').trigger(e)
		var others = items.not(first)
		
		expect(others.length + 1)
		ok(!isSelected(first), 'item is no longer selected')
		others.each(function(){
			ok(!isSelected($(this)), 'item is not selected')
		})
	}

	test('should unselect last selected item only when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselect_last_item_test(getCtrlClickEvent())
	})

	test('should unselect last selected item only when clicked with ctrl modifier', function(){
		do_ctrl_meta_click_unselect_last_item_test(getMetaClickEvent())
	})

	// Abstracted test into function to keep tests DRY
	function do_ctrl_meta_click_unselected_test(e){
		expect(2)
		
		var list = getMultiselectableList()
		var items = list.find('li')
		var first = items.first().trigger('mousedown')
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
		var first = items.first().trigger('mousedown')
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
