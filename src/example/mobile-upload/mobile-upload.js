/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-17
 * Time: 18:06:23
 * Contact: 55342775@qq.com
 */
function Mobile_upload() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'upload_' + rnd;
	this.fileInput;
}
Mobile_upload.prototype = {
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
