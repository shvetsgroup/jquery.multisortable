/**
 * jquery.multisortable.js - v0.2.1
 * https://github.com/pokop/jquery.multisortable
 *
 * Author: Ethan Atlakson, Jay Hayes, Gabriel Such, Alexander Shvets, Or Virnik
 * Last Revision 1/24/2014
 * multi-selectable, multi-sortable jQuery plugin
 */

!function($) {

	$.fn.multiselectable = function(options) {
		if (!options) {
			options = {}
		}
		options = $.extend({}, $.fn.multiselectable.defaults, options);

		function mouseDown(e) {
			var item = $(this),
				parent = item.parent(),
				myIndex = item.index();
			
			// If the event's target doesn't pass the cancel-filter, ignore the event.
			if ( options.cancel && $(e.target).is(options.cancel) ) {
				return;
			}

			var prev = parent.find('.multiselectable-previous');
			// If no previous selection found, start selecting from first selected item.
			prev = prev.length ? prev : $(parent.find('.' + options.selectedClass)[0]).addClass('multiselectable-previous');
			var prevIndex = prev.index();

			if (e.ctrlKey || e.metaKey) {
				if (item.hasClass(options.selectedClass)) {
					item.removeClass(options.selectedClass).removeClass('multiselectable-previous')
					if (item.not('.child').length) {
						item.nextUntil(':not(.child)').removeClass(options.selectedClass);
					}
				}
				else {
					parent.find('.multiselectable-previous').removeClass('multiselectable-previous');
					item.addClass(options.selectedClass).addClass('multiselectable-previous')
					if (item.not('.child').length) {
						item.nextUntil(':not(.child)').addClass(options.selectedClass);
					}
				}
			}

			if (e.shiftKey) {
				var last_shift_range = parent.find('.multiselectable-shift');
				last_shift_range.removeClass(options.selectedClass).removeClass('multiselectable-shift');

				var shift_range;
				if (prevIndex < myIndex) {
					shift_range = item.prevUntil('.multiselectable-previous').add(prev).add(item);
				}
				else if (prevIndex > myIndex) {
					shift_range = item.nextUntil('.multiselectable-previous').add(prev).add(item);
				}
				shift_range.addClass(options.selectedClass).addClass('multiselectable-shift');
			}
			else {
				parent.find('.multiselectable-shift').removeClass('multiselectable-shift');
			}

			if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
				parent.find('.multiselectable-previous').removeClass('multiselectable-previous');
				if (!item.hasClass(options.selectedClass)) {
					parent.find('.' + options.selectedClass).removeClass(options.selectedClass);
					item.addClass(options.selectedClass).addClass('multiselectable-previous');
					if (item.not('.child').length) {
						item.nextUntil(':not(.child)').addClass(options.selectedClass);
					}
				}
			}

			options.mousedown.call(this, e, item);
		}

		function click(e) {
			var item = $(this),	
				  parent = item.parent();
			
			if ( item.is('.ui-draggable-dragging') ) {
				return;
			}
			
			// If the event's target doesn't pass the cancel-filter, ignore the event.
			if ( options.cancel && $(e.target).is(options.cancel) ) {
				return;
			}

			// If item wasn't draged and is not multiselected, it should reset selection for other items.
			if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
				parent.find('.multiselectable-previous').removeClass('multiselectable-previous');
				parent.find('.' + options.selectedClass).removeClass(options.selectedClass);
				item.addClass(options.selectedClass).addClass('multiselectable-previous');
				if (item.not('.child').length) {
					item.nextUntil(':not(.child)').addClass(options.selectedClass);
				}
			}

			options.click.call(this, e, item);
		}

		return this.each(function() {
			var list = $(this);

			if (!list.data('multiselectable')) {
				list.data('multiselectable', true)
					.delegate(options.items, 'mousedown', mouseDown)
					.delegate(options.items, 'click', click)
					.disableSelection();
			}
		})
	};

	$.fn.multiselectable.defaults = {
		click: function(event, elem) {},
		mousedown: function(event, elem) {},
		selectedClass: 'selected',
		items: '>*',
		cancel: false,
	};


	$.fn.multisortable = function(options) {
		if (!options) {
			options = {}
		}
		var settings = $.extend({}, $.fn.multisortable.defaults, options);

		function regroup(item, list) {
			if (list.find('.' + settings.selectedClass).length > 0) {
				var myIndex = item.data('i');

				var itemsBefore = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') < myIndex
				}).css({
						position: '',
						width: '',
						left: '',
						top: '',
						zIndex: ''
					});

				item.before(itemsBefore);

				var itemsAfter = list.find('.' + settings.selectedClass).filter(function() {
					return $(this).data('i') > myIndex
				}).css({
						position: '',
						width: '',
						left: '',
						top: '',
						zIndex: ''
					});

				item.after(itemsAfter);

				setTimeout(function() {
					itemsAfter.add(itemsBefore).addClass(settings.selectedClass);
				}, 0);
			}
		}

		return this.each(function() {
			var list = $(this);

			//enable multi-selection
			list.multiselectable({
				selectedClass: settings.selectedClass,
				click: settings.click,
				items: settings.items,
				cancel: settings.cancel,
				mousedown: settings.mousedown
			});

			//enable sorting
			options.cancel = settings.items + ':not(.' + settings.selectedClass + ')'
			if (settings.cancel) {
				debugger;
				options.cancel += ',' + settings.cancel
			}
			options.placeholder = settings.placeholder;
			options.start = function(event, ui) {
				var parent = ui.item.parent();

				//assign indexes to all selected items
				ui.items = parent.find('.' + settings.selectedClass).each(function(i) {
					$(this).data('i', i);
				});

				// adjust placeholder size to be size of items
				var height = parent.find('.' + settings.selectedClass).length * ui.item.outerHeight(); // TODO: this line assumes that all the selected items are at the same height. fix it.
				ui.placeholder.height(height);

				settings.start.call(this, event, ui);
			};

			options.stop = function(event, ui) {
				regroup(ui.item, ui.item.parent());
				ui.items = ui.item.parent().find('.' + settings.selectedClass);
				settings.stop.call(this, event, ui);
			};

			options.sort = function(event, ui) {
				var parent = ui.item.parent(),
					myIndex = ui.item.data('i'),
					top = parseInt(ui.item.css('top').replace('px', '')),
					left = parseInt(ui.item.css('left').replace('px', ''));

				// fix to keep compatibility using prototype.js and jquery together
				$.fn.reverse = Array.prototype._reverse || Array.prototype.reverse

				ui.items = $('.' + settings.selectedClass, parent);
				var height = 0;
				ui.items.filter(function() {
					return $(this).data('i') < myIndex;
				}).reverse().each(function() {
						height += $(this).outerHeight();
						$(this).css({
							left: left,
							top: top - height,
							position: 'absolute',
							zIndex: 1000,
							width: ui.item.width()
						})
					});

				height = ui.item.outerHeight();
				ui.items.filter(function() {
					return $(this).data('i') > myIndex;
				}).each(function() {
						var item = $(this);
						item.css({
							left: left,
							top: top + height,
							position: 'absolute',
							zIndex: 1000,
							width: ui.item.width()
						});

						height += item.outerHeight();
					});

				settings.sort.call(this, event, ui);
			};

			options.receive = function(event, ui) {
				regroup(ui.item, ui.sender);
				ui.items = ui.item.parent().find('.' + settings.selectedClass);
				settings.receive.call(this, event, ui);
			};

			list.sortable(options).disableSelection();
		})
	};

	$.fn.multisortable.defaults = {
		start: function(event, ui) {},
		stop: function(event, ui) {},
		sort: function(event, ui) {},
		receive: function(event, ui) {},
		click: function(event, elem) {},
		mousedown: function(event, elem) {},
		selectedClass: 'selected',
		placeholder: 'placeholder',
		items: '>*',
		cancel: false,
	};

}(jQuery);