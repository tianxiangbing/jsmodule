//console.log('This would be the main JS file.');
(function($) {
	$('#search').on('keyup', function() {
		var val = this.value;
		var modulelist = $('#modulelist').children();
		for (var i = 0, l = modulelist.length; i < l; i++) {
			var item = $(modulelist[i]);
			var text = $('.m-title', item).html();
			var link = $('.m-title', item).attr('href').split('.')[0];
			if (text.toString().indexOf(val) != -1 || link.toString().indexOf(val) != -1 ) {
				item.show();
			} else {
				item.hide();
			}
		}
	});
})(jQuery);