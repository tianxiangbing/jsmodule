/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-04-29
 * Time: 11:06:03
 * Contact: 55342775@qq.com
 */
;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Upload = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	function Upload() {}
	$.extend(Upload.prototype, {
		init: function(settings) {
			window.uploadCount =window.uploadCount||0;
			window.uploadCount++;
			var rnd = Math.random().toString().replace('.', '');
			this.id = 'upload_' + rnd+window.uploadCount.toString();
			this.settings = settings;
			this.settings.iframe = true;
			this.url = this.settings.url;
			this.name = this.settings.name || "files";
			this.target = this.settings.target;
			this.createIframe();
			this.createFile();
			this.bindEvent();
			this.bindFileChange();
		},
		createIframe: function() {
			this.frameId = 'iframe_upload';
			if ($('#' + this.frameId).length == 0) {
				var ifm = '<iframe src="about:blank" id="' + this.frameId + '" name="' + this.frameId + '" width="0" height="0" frameborder="0"></iframe>';
				$('body').append(ifm);
			}
			this.frame = $('#' + this.frameId);
		},
		createFile: function() {
			var _this = this;
			_this.form && _this.form.remove();
			_this.form = $('<form method="post" ENCTYPE="multipart/form-data"><input type="file" style="position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;" id="' + _this.id + '" name="' + _this.name + '"/></form>');
			_this.form.attr("target", _this.frameId);
			_this.form.css({
				height: 0,
				widht: 0,
				padding: 0
			});
			_this.form.attr("action", _this.url);
			$('body').append(_this.form);
			_this.fileInput = $('#' + _this.id);
			this.bindFileChange();
		},
		postFrame: function(input, e, key) {
			var arr = input.value.split('.');
			var ext = arr[arr.length - 1];
			var _this = this;
			var typelist = (this.settings.accept && this.settings.accept.split(',')) || [];
			var hasext = false;
			for (var i = typelist.length - 1; i >= 0; i--) {
				var re = new RegExp(typelist[i], "i");
				if (re.exec(ext)) {
					hasext = true;
				}
			};
			if (!hasext && typelist.length) {
				var msg = '文件格式错误,支持格式：' + this.settings.accept;
				if ($.alert) {
					$.alert(msg);
				} else {
					alert(msg);
				}
				return false;
			}
			this.form.submit();
			this.frame.off('load');
			this.frame.on('load', function() {
				var body = $($(this.contentWindow.document).find('body'));
				var child = body.children()[0];
				var result = body.html();
				if (child && child.nodeType == 1) {
					result = child.innerHTML;
				}
				_this.settings.callback && _this.settings.callback(result, _this.fileInput, _this.name, _this.target, key);
			});
			_this.createFile();
			return true;
		},
		touch: function(obj, fn) {
			var move;
			$(obj).on('click', click);

			function click(e) {
				return fn.call(this, e);
			}
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
				if ($(this).parent().siblings().size() >= _this.settings.max) {
					_this.settings.maxCallback && _this.settings.maxCallback(this);
				} else {
					$(_this.fileInput).trigger('click');
				}
				return false;
			});
			_this.bindFileEvent();
		},
		bindFileEvent: function() {
			var _this = this;
			$(this.fileInput).click(function(e) {
				e.stopPropagation();
			});
		},
		bindFileChange: function() {
			var _this = this;
			$(_this.fileInput).off('change');
			$(_this.fileInput).on('change', function(e) {
				console.log(_this)
				var reg_type = /^image\//i;
				var files = e.target.files;
				if (_this.settings.iframe) {
					//ifrmae post
					var key = "up_" + Math.random().toString().replace('.', '');
					if (_this.postFrame(this, e, key)) {
						_this.settings.startUpload && _this.settings.startUpload(_this.fileInput, _this.target, key);
					}
				}
			});
		}
	});
	return Upload;
});