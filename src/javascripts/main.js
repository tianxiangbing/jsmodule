//console.log('This would be the main JS file.');
(function($) {
	$('#search').on('keyup', function() {
		var val = this.value;
		var modulelist = $('#modulelist').children();
		for (var i = 0, l = modulelist.length; i < l; i++) {
			var item = $(modulelist[i]);
			var text = $('.m-title', item).html();
			var link = $('.m-title', item).attr('href').split('.')[0];
			if (text.toString().indexOf(val) != -1 || link.toString().indexOf(val) != -1) {
				item.show(500);
			} else {
				item.hide(500);
			}
		}
	});
	// $('#modulelist').height($('#modulelist').height())
	// $('#modulelist').width($('#modulelist').width())

	function Sort() {
		var arr = $('#modulelist').children();
		var oldPositionArray = [];
		arr.each(function() {
			var item = $(this);
			var pos = item.position();
			item.attr(pos);
			oldPositionArray.push(pos);
		});
		arr.sort(function(item) {
			var $item = $(item);
			$item.css({
				position: 'absolute',
				left: parseInt($item.attr('left')),
				top: parseInt($item.attr('top'))
			});
			return Math.random() > .5 ? 1 : -1;
		});
		$('#modulelist').children().remove();
		arr.each(function(i, d) {
			var item = $(this);
			$('#modulelist').append(item);
			item.css('position', "absolute").animate({
				left: parseInt(oldPositionArray[i].left),
				top: parseInt(oldPositionArray[i].top)
			}, 1500, function() {
				item.css('position','static');
			});
		});
	};
	Sort();
})(jQuery);