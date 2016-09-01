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
			window.uploadCount = window.uploadCount || 0;
			window.uploadCount++;
			var rnd = Math.random().toString().replace('.', '');
			this.id = 'upload_' + rnd + window.uploadCount.toString();
			this.settings = settings;
			this.settings.iframe = true;
			this.settings.zIndex = this.settings.zIndex || 9999;
			this.url = this.settings.url;
			this.name = this.settings.name || "files";
			this.postData = this.settings.postData || null;
			this.target = this.settings.target;
			this.postTarget = this.settings.postTarget;
			typeof this.settings.autoPost === "undefined" ? this.autoPost = true : this.autoPost = this.settings.autoPost;
			this.createIframe();
			this.createFile();
			this.bindEvent();
			this.bindFileChange();
		},
		createIframe: function() {
			this.frameId = 'iframe_upload';
			if ($('#' + this.frameId).length == 0) {
				var ifm = '<iframe style="display:none;" src="about:blank" id="' + this.frameId + '" name="' + this.frameId + '" width="0" height="0" frameborder="0"></iframe>';
				$('body').append(ifm);
			}
			this.frame = $('#' + this.frameId);
		},

		createPostData: function(){
			var res = '';
			var pd = this.settings.postData;
			if(pd) {
				for(var key in pd){
					res += '<input value="'+ pd[key] +'" name="'+ key +'"/>';
				}
			}
			return res;
		},

		createFile: function() {
			var _this = this;
			_this.form && _this.form.remove();
			_this.form = $('<form method="post" ENCTYPE="multipart/form-data"><input type="file"  id="' + _this.id + '" name="' + _this.name + '"/>'+ _this.createPostData() +'</form>');
			_this.form.attr("target", _this.frameId);
			_this.form.css({
				height: 0,
				width: 0,
				overflow: 'hidden'
			});
			_this.form.attr("action", _this.url);
			$('body').append(_this.form);
			_this.fileInput = $('#' + _this.id);
			_this.fileInput.css({
				width: 60,
				height: 20,
				opacity: 0,
				zIndex: _this.settings.zIndex
			})
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
			_this.form.submit();
			_this.createFile();
			this.frame.off('load');
			this.frame.on('load', function() {
				var body = $($(this.contentWindow.document).find('body'));
				var child = body.children()[0];
				var result = body.html();
				if (child && child.nodeType == 1) {
					result = child.innerHTML;
				}
				if (typeof result == "string" && _this.settings.type === "json") {
					result = (new Function("return " + result))();
				}
				_this.settings.callback && _this.settings.callback.call(_this, result, _this.fileInput, _this.name, _this.target, key);
			});
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
			/*
			this.touch($(this.target), function(e, t) {
				if ($(this).parent().siblings().size() >= _this.settings.max) {
					_this.settings.maxCallback && _this.settings.maxCallback(this);
				} else {
					$(_this.fileInput).trigger('click');
				}
				return false;
			});
			 */
			var move;
			$(this.target).on('mousemove touchstart', function(e) {
				var event;
				if (e.changedTouches) {
					event = (e.changedTouches || e.originalEvent.changedTouches)[0];
				} else {
					event = e;
				}
				var x = event.pageX - 30;
				var y = event.pageY - 10;
				$(_this.fileInput).css({
					left: x,
					top: y,
					position: 'absolute'
				});
				move = true;
			}).on('touchend', function(e) {
				if (move) {
					move = false;
					e.preventDefault();
					if (!move) {
						$(_this.fileInput).trigger('click');
					}
					move = false;
				}
			});
			_this.bindFileEvent();
			if (this.postTarget) {
				this.touch($(this.postTarget), function(e, t) {
					if (_this.args.length) {
						if (_this.postFrame.apply(_this, _this.args)) {
							_this.settings.startUpload && _this.settings.startUpload.apply(_this, _this.args);
						}
					}
				});
			}
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
				var reg_type = /^image\//i;
				var files = e.target.files;
				var key = "up_" + Math.random().toString().replace('.', '');
				_this.args = [this, e, key];
				_this.settings.selected && _this.settings.selected.call(this, this, e, key);
				if (_this.settings.iframe) {
					//ifrmae post
					if (_this.autoPost) {
						if (_this.postFrame(this, e, key)) {
							_this.settings.startUpload && _this.settings.startUpload(_this.fileInput, _this.target, key);
						}
					}
				}
			});
		}
	});
	return Upload;
});
