/*
 * jquery.multisortable.js - v0.1.2
 * https://github.com/iamvery/jquery.multisortable
 *
 * Author: Ethan Atlakson, Jay Hayes
 * Last Revision 3/16/2012
 * multi-selectable, multi-sortable jQuery plugin
*/

!function($){
	
	$.fn.multiselectable = function(options) {
		if (!options) { options = {} }
		options = $.extend({}, $.fn.multiselectable.defaults, options)
		
		return this.each(function() {
			var list = $(this)
			
			if (!list.children().data('multiselectable')) {
				list.children().data('multiselectable', true)
				list.children().click(function(e) {
					var item = $(this),
						parent = item.parent(),
						myIndex = parent.children().index(item),
						prevIndex = parent.children().index(parent.find('.multiselectable-previous'))
					
					if (!e.ctrlKey && !e.metaKey)
						parent.find('.' + options.selectedClass).removeClass(options.selectedClass)
					else {
						if (item.not('.child').length) {
							if (item.hasClass(options.selectedClass))
								item.nextUntil(':not(.child)').removeClass(options.selectedClass)
							else
								item.nextUntil(':not(.child)').addClass(options.selectedClass)
						}
					}
					
					if (e.shiftKey && prevIndex >= 0) {
						parent.find('.multiselectable-previous').toggleClass(options.selectedClass)
						if (prevIndex < myIndex)
							item.prevUntil('.multiselectable-previous').toggleClass(options.selectedClass)
						else if (prevIndex > myIndex)
							item.nextUntil('.multiselectable-previous').toggleClass(options.selectedClass)
					}
					
					item.toggleClass(options.selectedClass)
					parent.find('.multiselectable-previous').removeClass('multiselectable-previous')
					item.addClass('multiselectable-previous')
					
					options.click(e, item)
				}).disableSelection()
			}
		})
	}
	
	$.fn.multiselectable.defaults = {
		click: function(event, elem){},
		selectedClass: 'selected'
	}
	
	$.fn.multisortable = function(options) {
		if (!options) { options = {} }
		settings = $.extend({}, $.fn.multisortable.defaults, options)
		
		function regroup(item, list) {
			if (list.find('.' + settings.selectedClass).length > 0) {
				var myIndex = item.data('i')
				
				var itemsBefore = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') < myIndex
				}).css({
					position: '',
					width: ''
				})
				
				item.before(itemsBefore)
				
				var itemsAfter = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') > myIndex
				}).css({
					position: '',
					width: ''
				})
				
				item.after(itemsAfter)
				
				setTimeout(function(){
					itemsAfter.add(itemsBefore).addClass(settings.selectedClass)
				}, 0)
			}
		}
		
		return this.each(function() {
			var list = $(this)
			var tagName = list.children().get(0).tagName
			
			//enable multi-selection
			list.multiselectable({selectedClass: settings.selectedClass, click: settings.click})
			
			//enable sorting
			options.cancel = tagName+':not(.'+settings.selectedClass+')'
			options.placeholder = settings.placeholder
			options.start = function(event, ui) {
				if (ui.item.hasClass(settings.selectedClass)) {
					var parent = ui.item.parent()
					
					//assign indexes to all selected items
					parent.find('.' + settings.selectedClass).each(function(i) {
						$(this).data('i', i)
					})
					
					// adjust placeholder size to be size of items
					var height = parent.find('.' + settings.selectedClass).length * ui.item.outerHeight()
					ui.placeholder.height(height)
				}
				
				settings.start(event, ui)
			}
			
			options.stop = function(event, ui) {
				regroup(ui.item, ui.item.parent())
				settings.stop(event, ui)
			}
			
			options.sort = function(event, ui) {
				var parent = ui.item.parent(),
					myIndex = ui.item.data('i'),
					top = parseInt(ui.item.css('top').replace('px', '')),
					left = parseInt(ui.item.css('left').replace('px', ''))
				
				$.fn.reverse = Array.prototype.reverse
				var height = 0
				$('.' + settings.selectedClass, parent).filter(function() {
					return $(this).data('i') < myIndex
				}).reverse().each(function() {
					height += $(this).outerHeight()
					$(this).css({
						left: left,
						top: top - height,
						position: 'absolute',
						zIndex: 1000,
						width: ui.item.width()
					})
				})
				
				var height = ui.item.outerHeight()
				$('.' + settings.selectedClass, parent).filter(function() {
					return $(this).data('i') > myIndex
				}).each(function() {
					var item = $(this)
					item.css({
						left: left,
						top: top + height,
						position: 'absolute',
						zIndex: 1000,
						width: ui.item.width()
					})
					
					height += item.outerHeight()
				})
				
				settings.sort(event, ui)
			}
			
			options.receive = function(event, ui) {
				regroup(ui.item, ui.sender)
				settings.receive(event, ui)
			}
			
			list.sortable(options).disableSelection()
		})
	}
	
	$.fn.multisortable.defaults = {
		start: function(event, ui) { },
		stop: function(event, ui) { },
		sort: function(event, ui) { },
		receive: function(event, ui) { },
		click: function(event, elem) { },
		selectedClass: 'selected',
		placeholder: 'placeholder'
	}
	
}(jQuery);
