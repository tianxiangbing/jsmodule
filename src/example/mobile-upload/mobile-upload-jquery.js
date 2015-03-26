/*! mobile-upload name:田想兵 qq:55342775 tianxiangbing http://www.lovewebgames.com/jsmodule/p_upload.html 2015-03-25*/
function Mobile_upload() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'upload_' + rnd;
	this.fileInput;
}
Mobile_upload.prototype = {
	init: function(settings) {
		this.settings = $.extend({}, this.settings, settings);
		this.target = this.settings.target;
		$(this.target).after('<input type="file" style="position:absolute;top:0;left:0;width:1px;height:1px;"  accept="image/*" id="' + this.id + '"/>');
		this.fileInput = $('#' + this.id);
		this.name = this.settings.name || "files";
		this.fileInput.css({
			'opacity': '0',
			width: 1
		});
		if (this.settings.multiple) {
			this.fileInput.attr('multiple', 'multiple');
		}
		this.bindEvent();
	},
	touch: function(obj, fn) {
		var move;
		$(obj).on('click', fn);
		$(obj).on('touchmove', function(e) {
			move = true;
		}).on('touchend', function(e) {
			e.preventDefault();
			if (!move) {
				var returnvalue = fn.call(this, e, 'touch');
				if (!returnvalue) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
			move = false;
		});
	},
	bindEvent: function(e) {
		var _this = this;
		this.touch($(this.target), function(e, t) {
			console.log(t)
			$(_this.fileInput).trigger('click');
			return false;
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
						if (_this.settings.ajax) {
							var data = {};
							data[_this.settings.ajax.name||'file'] = this.result;
							$.ajax({
								type: 'post',
								url: _this.settings.ajax.url,
								data:data,
								datatype: 'json',
								success: function(result) {
									if (_this.settings.callback) {
										_this.settings.callback(result);
									}
								}
							});
						} else
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
	$.fn.Mobile_upload = function(settings) {
		var list = [];
		$(this).each(function() {
			var upload = new Mobile_upload();
			var options = $.extend({
				target: $(this)
			}, settings);
			upload.init(options);
			list.push(upload);
		});
		return list;
	}
})(jQuery);