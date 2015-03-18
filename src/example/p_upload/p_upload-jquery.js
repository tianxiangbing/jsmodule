/*! p_upload - v1.0.0 - tianxiangbing - http://www.lovewebgames.com/jsmodule/p_upload.html2015-03-18 */
function P_upload() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'upload_' + rnd;
	this.fileInput;
}
P_upload.prototype = {
	init: function(settings) {
		this.settings = $.extend({}, this.settings, settings);
		this.target = this.settings.target;
		$(this.target).after('<input type="file"  accept="image/*" id="' + this.id + '"/>');
		this.fileInput = $('#' + this.id);
		this.name = this.settings.name || "files";
		this.fileInput.hide();
		if (this.settings.multiple) {
			this.fileInput.attr('multiple', 'multiple');
		}
		this.bindEvent();
	},
	bindEvent: function(e) {
		var _this = this;
		$(this.target).click(function() {
			$(_this.fileInput).trigger('click');
		});
		$(this.fileInput).change(function(e) {
			var reg_type = /^image\//i;
			var files = e.target.files;
			for (var i = files.length - 1; i >= 0; i--) {
				var file = files[i];
				if (reg_type.test(file.type)) {
					var reader = new FileReader();
					reader.onload = function() {
						// $('body').append('<img src="'+this.result+'"/><input type="hidden" name="'+_this.name+'"/>');
						if (_this.settings.callback) {
							_this.settings.callback(this.result, file, _this.name);
						}
					};
					reader.readAsDataURL(file);
				} else {
					alert("不是图片文件");
					break;
				}
			};
		});
	}
};

(function($) {
	$.fn.P_upload = function(settings) {
		var list = [];
		$(this).each(function() {
			var upload = new P_upload();
			var options = $.extend({
				target: $(this)
			}, settings);
			upload.init(options);
		});
		return list;
	}
})(jQuery);