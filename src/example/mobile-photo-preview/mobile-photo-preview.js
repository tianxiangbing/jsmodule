/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-04-08
 * Time: 11:52:47
 * Contact: 55342775@qq.com
 */

;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$', 'dialog'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.MobilePhotoPreview = factory($, Dialog);
	}
})(this, function($, Dialog) {
	//jquery plugin
	$.fn.MobilePhotoPreview = function(settings) {
		$(this).each(function() {
			var photoPreview = new MobilePhotoPreview();
			photoPreview.init($.extend({
				target: $(this)
			}, settings));
		});
	};
	//Class...
	function MobilePhotoPreview() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'mp_' + rnd;
		this.currentIndex = 1;
		this.sum = 1;
		this.arr = [];
		this.objArr = {};
		this.dialog;
		this.bloom = true;
	};
	MobilePhotoPreview.prototype = {
		init: function(settings) {
			this.settings = $.extend({
				animate: true
			}, settings);
			this.target = $(this.settings.target);
			this.trigger = this.settings.trigger || "a";
			this.bloom = this.settings.bloom;
			this.bindEvent();
		},
		touch: function(obj, parent, fn) {
			var move;
			var istouch = false;
			if (typeof parent === "function") {
				fn = parent;
			};
			$(obj).on('touchmove', parent, function(e) {
				move = true;
			}).on('touchend', parent, function(e) {
				e.preventDefault();
				if (!move) {
					var returnvalue = fn.call(this, e, 'touch');
					if (returnvalue === false) {
						e.preventDefault();
						e.stopPropagation();
					}
				}
				move = false;
			});
			$(obj).on('click', parent, click);

			function click(e) {
				return fn.call(this, e);
			}
		},
		bindEvent: function() {
			var _this = this;
			_this.touch(_this.target, _this.trigger, function() {
				_this.initDailog.call(_this, this);
				return false;
			});
		},
		bindSlide: function() {
			/*滑动*/
			var _this = this;
			var start = {},
				istartleft = 0,
				end = {},
				move = false;
			var curPos = {};
			_this.imgPreview.on('touchstart', function(e) {
				var events =  (e.changedTouches || e.originalEvent.changedTouches);
				start = {
					x: events[0].pageX,
					y: events[0].pageY
				};
				if (events.length == 2) {
					move = false;
					return false;
				};
				curPos = $(this).position();
				istartleft = event.pageX;
			});
			_this.imgPreview.on('touchmove', function(e) {
				var events =  (e.changedTouches || e.originalEvent.changedTouches);
				if (events.length == 2) {
					return false;
				}
				move = true;
				end = {
					x: events[0].pageX,
					y: events[0].pageY
				};
				// var curPos = $(this).position();
				if (!_this.bloom) {
					//只移动x轴
					curPos.left = curPos.left + (end.x - start.x);
					$(this).css({
						left: curPos.left
					});
				} else {
					curPos = {
						left: curPos.left + (end.x - start.x),
						top: curPos.top + (end.y - start.y)
					}
					$(this).css(curPos);
				}
				start = end;
				return false;
			});
			_this.imgPreview.on('touchend', function(e) {
				var events =  (e.changedTouches || e.originalEvent.changedTouches);
				end = {
					x: events[0].pageX,
					y: events[0].pageY
				};
				if (events.length == 2) {
					start = end;
					return false;
				}
				var curPos = $(this).position();
				var stopPos = {
					left: curPos.left + (end.x - start.x),
					top: curPos.top + (end.y - start.y)
				};
				$(this).css(stopPos);
				var mod = Math.abs(stopPos.left / _this.maxWidth);
				//取小数
				var arr = mod.toString().split('.');
				var mode = 0;
				var decimal = arr.length > 1 ? '0.' + arr[1] : 0;
				if (decimal > 0.3) {
					mode = Math.ceil(mod);
				} else {
					mode = Math.floor(mod);
				}
				_this.currentIndex = mode;
				if (istartleft < end.x) {
					_this.currentIndex--;
				}
				if (_this.currentIndex < 0) {
					_this.currentIndex = 0;
				}
				if (_this.currentIndex >= _this.arr.length) {
					_this.currentIndex = _this.arr.length - 1;
				}
				_this.go(_this.settings.animate);
				move = false;
			});
		},
		go: function(animate) {
			var _this = this;
			var left = _this.currentIndex * _this.maxWidth;
			animate = animate ? "animate" : "css";
			$(_this.imgPreview)[animate]({
				left: -left,
				top: 0
			}, 200);
			var c = _this.dialog.dialogContainer;
			$('.imgViewTop em', c).html((_this.currentIndex + 1) + '/' + _this.arr.length);
			_this.current = $(_this.arr[_this.currentIndex]);
			_this.settings.callback && _this.settings.callback.call(_this, _this.objArr[_this.currentIndex], _this.currentIndex);
		},
		initDailog: function(target) {
			var _this = this;
			_this.dialog = null;
			_this.dialog = new Dialog();
			_this.arr = _this.target.find(_this.trigger);
			_this.sum = _this.arr.length;
			_this.currentIndex = $(target).index();
			var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
			var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
			var options = $.extend({
				target: '<div class="imgViewTop"><em>' + (_this.currentIndex + 1) + '/' + _this.sum + '</em></div><div class="pos-relative"><div id="imgPreview"></div></div><div id="imgTitle"></div>',
				animate: true,
				show: true,
				width: clientWidth,
				height: clientHeight,
				mask: true,
				className: "ui-preview",
				afterHide: function(c) {
					this.dispose();
					_this.settings.hide && _this.settings.hide();
				},
				beforeHide: function() {
					var cur = _this.imgPreview.children()[_this.currentIndex];
					$(cur).siblings().hide();
				},
				beforeShow: function(c) {
					var _self = this;
					_this.imgPreview = $('#imgPreview', c);
					_this.format(c);
					_this.bindSlide();
					_this.go(false);
					_this.settings.show && _this.settings.show.call(_this, _this.dialog.dialogContainer);
					_this.imgPreview.on('click', function() {
						_self.dispose();
					});
				}
			}, {});
			_this.dialog.init(options);
		},
		hide: function() {
			this.dialog.hide();
		},
		format: function(c) {
			var _this = this;
			this.length = 0;
			var html = "";
			for (var i = 0, len = _this.arr.length; i < len; i++) {
				var item = $(_this.arr[i]);
				var isdisplay = 'style="visibility:hidden;"';
				if (i == _this.currentIndex) {
					isdisplay = 'style="display:block;"';
				}
				var src = item.attr('href') || item.find('input').val() || item.find('img').attr('src')||item.attr('src');
				html += '<div ' + isdisplay + '></div>';
				(function(item, i, src) {
					setTimeout(function() {
						var img = new Image();
						img.src = src;
						if (img.complete) {
							setObj.call(img, i);
						} else {
							img.onreadystatechange = function() {
								if (this.readystate == "complete" || this.readyState == "loaded") {
									setObj.call(this, i);
								}
							}
							img.onload = function() {
								setObj.call(this, i);
							}
						}
					}, 100);
				})(item, i, src);
			}
			_this.imgPreview.html(html);
			setTimeout(function() {
				_this.imgPreview.children().css('visibility', 'visible');
			}, 500);

			function setObj(i) {
				_this.length++;
				var obj = $(_this.imgPreview.children().get(i));
				var img = $(this);
				var height = img[0].height;
				var width = img[0].width;
				obj.html(img);
				obj.css('background', 'transparent');
				_this.objArr[i] = {
					src: this.src,
					height:height,
					width: width,
					elem: img,
					index: i
				};
				_this.objArr.length = _this.length;
				// if (_this.arr.length == _this.objArr.length) {
				// 	console.log(_this.objArr)
				// }
				_this.initSize(i);
			}
			_this.setSize();
			$(window).resize($.proxy(_this.setSize, _this));
		},
		setSize: function() {
			var _this = this;
			var c = _this.dialog.dialogContainer;
			var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
			var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
			this.maxHeight = clientHeight - $('.imgViewTop', c).height() - $('.imgTitle', c).height();
			this.maxWidth = clientWidth;
			_this.imgPreview.width(this.maxWidth * _this.arr.length);
			_this.imgPreview.height(this.maxHeight);
			_this.imgPreview.children('div').width(this.maxWidth);
		},
		//img size
		initSize: function(i) {
			var obj = this.objArr[i];
			if (this.maxHeight < obj.height) {
				obj.elem.height(this.maxHeight);
				var w = this.maxHeight * obj.width / obj.height;
				obj.elem.width(w);
				obj.height = this.maxHeight;
				obj.width = w;
			}
			if (this.maxWidth < obj.width) {
				obj.elem.width(this.maxWidth);
				var h = this.maxWidth * obj.height / obj.width;
				obj.elem.height(h);
				obj.height = h;
				obj.width = this.maxWidth;
			}

			//center
			var top = (this.maxHeight - obj.height) / 2;
			var left = (this.maxWidth - obj.width) / 2;
			obj.elem.css({
				'top': top,
				left: left
			});
		}
	};
	return MobilePhotoPreview;
});