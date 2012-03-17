/*
 * jquery.multisortable.js
 * https://github.com/iamvery/jquery.multisortable
 *
 * Author: Ethan Atlakson, Jay Hayes
 * Last Revision 3/16/2012
 * multi-selectable, multi-sortable jQuery plugin
 * jquery.multisortable.js
 * v0.1.1
*/

jQuery.fn.multiselectable = function(options) {
	if (!options) { options = {}; }
	options = jQuery.extend({}, jQuery.fn.multiselectable.defaults, options);
	
	return this.each(function() {
		var t = jQuery(this);
		
		if (!jQuery(t.children()).data('multiselectable')) {
			jQuery(t.children()).data('multiselectable', true);
			jQuery(t.children()).click(function(e) {
				var parent = jQuery(this).parent();
				var myIndex = jQuery(parent.children()).index(jQuery(this));
				var prevIndex = jQuery(parent.children()).index(jQuery('.multiselectable-previous', parent));
				
				if (!e.ctrlKey && !e.metaKey) {
					jQuery('.' + options.selectedClass, parent).removeClass(options.selectedClass);
				} else {
					if (jQuery(this).not('.child').length) {
						if (jQuery(this).hasClass(options.selectedClass))
							jQuery(this).nextUntil(':not(.child)').removeClass(options.selectedClass);
						else
							jQuery(this).nextUntil(':not(.child)').addClass(options.selectedClass);
					}
				}
				
				if (e.shiftKey && prevIndex >= 0) {
					jQuery('.multiselectable-previous', parent).toggleClass(options.selectedClass);
					if (prevIndex < myIndex) {
						jQuery(this).prevUntil('.multiselectable-previous').toggleClass(options.selectedClass);
					} else if (prevIndex > myIndex) {
						jQuery(this).nextUntil('.multiselectable-previous').toggleClass(options.selectedClass);
					}
				}
				
				jQuery(this).toggleClass(options.selectedClass);
				jQuery('.multiselectable-previous', parent).removeClass('multiselectable-previous');
				jQuery(this).addClass('multiselectable-previous');
				options.click(e, $(this));
			}).disableSelection();
		}
	});
};

jQuery.fn.multiselectable.defaults = {
	click: function(event, elem){},
	selectedClass: 'selected'
};

jQuery.fn.multisortable = function(options) {
	if (!options) { options = {}; }
	settings = jQuery.extend({}, jQuery.fn.multisortable.defaults, options);
	
	function regroup(item, list) {
		if (jQuery('.' + settings.selectedClass, list).length > 0) {
			var myIndex = item.data('i');
			
			var itemsBefore = jQuery('.' + settings.selectedClass, list).filter(function() {
													return jQuery(this).data('i') < myIndex;
												}).css('position', '').css('width', '');
			item.before(itemsBefore);
			
			var itemsAfter =	jQuery('.' + settings.selectedClass, list).filter(function() {
													return jQuery(this).data('i') > myIndex;
												}).css('position', '').css('width', '');
			item.after(itemsAfter);
			
			setTimeout(function(){
				itemsAfter.add(itemsBefore).addClass(settings.selectedClass);
			}, 0);
		}
	}
	
	return this.each(function() {
		var t = jQuery(this);
		var tagName = t.children().get(0).tagName;
		
		//enable multi-selection
		t.multiselectable({selectedClass: settings.selectedClass, click: settings.click});
		
		//enable sorting
		options.cancel = tagName+':not(.'+settings.selectedClass+')';
		options.placeholder = settings.placeholder;
		options.start = function(event, ui) {
			if (ui.item.hasClass(settings.selectedClass)) {
				var parent = ui.item.parent();
				
				//assign indexes to all selected items
				jQuery('.' + settings.selectedClass, parent).each(function(i) {
					jQuery(this).data('i', i)
				});
				
				// adjust placeholder size to be size of items
				var height = jQuery('.' + settings.selectedClass, parent).length * ui.item.outerHeight();
				ui.placeholder.height(height);
			}
			
			settings.start(event, ui);
		};
		
		options.stop = function(event, ui) {
			regroup(ui.item, ui.item.parent());
			settings.stop(event, ui);
		};
		
		options.sort = function(event, ui) {
			var parent = ui.item.parent();
			var myIndex = ui.item.data('i');
			var top = parseInt(ui.item.css('top').replace('px', ''));
			var left = parseInt(ui.item.css('left').replace('px', ''));
			
			jQuery.fn.reverse = Array.prototype.reverse;
			var h = 0;
			jQuery('.' + settings.selectedClass, parent).filter(function() {
				return jQuery(this).data('i') < myIndex;
			}).reverse().each(function() {
				h += jQuery(this).outerHeight();
				jQuery(this).css({
					left: left,
					top: top - h,
					position: 'absolute',
					zIndex: 1000,
					width: ui.item.width()
				});
			});
			
			var h = ui.item.outerHeight();
			jQuery('.' + settings.selectedClass, parent).filter(function() {
				return jQuery(this).data('i') > myIndex;
			}).each(function() {
				jQuery(this).css({
					left: left,
					top: top + h,
					position: 'absolute',
					zIndex: 1000,
					width: ui.item.width()
				});
				
				h += jQuery(this).outerHeight();
			});
			
			settings.sort(event, ui);
		};
		
		options.receive = function(event, ui) {
			regroup(ui.item, ui.sender);
			settings.receive(event, ui);
		};
		
		jQuery(t).sortable(options).disableSelection();
	});
};

jQuery.fn.multisortable.defaults = {
	start: function(event, ui) { },
	stop: function(event, ui) { },
	sort: function(event, ui) { },
	receive: function(event, ui) { },
	click: function(event, elem) { },
	selectedClass: 'selected',
	placeholder: 'placeholder'
};
