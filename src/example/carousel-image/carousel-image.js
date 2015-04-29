/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-04-27
 * Time: 10:27:55
 * Contact: 55342775@qq.com
 */
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.ScrollLoad = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.CarouselImage = function(settings) {
		var list = [];
		$(this).each(function() {
			var car = new CarouselImage();
			var options = $.extend({
				target: $(this)
			}, settings);
			car.init(options);
			list.push(car);
		});
		return list;
	};

	function CarouselImage() {}
	CarouselImage.prototype = {
		init: function(settings) {
			this.index = 0;
			this.container = settings.target;
			this.content = this.container.children().first();
			this.timer = settings.timer || 3000;
			this.animate = settings.animate || 500;
			this.num = settings.num || null;
			this.list = this.content.children();
			this.step = this.list.first().width();
			this.content.width(this.list.length * this.step);
			this.size = this.list.length;
			this.content.css({
				left: 0,
				position: "absolute"
			});
			// alert(this.content.width())
			this.bindEvent();
			this.auto();
			this.formatNum();
		},
		touch: function(obj, trigger, fn) {
			var move;
			var istouch = false;
			if (typeof trigger === "function") {
				fn = trigger;
			};
			$(obj).on('touchmove', trigger, function(e) {
				move = true;
			}).on('touchend', trigger, function(e) {
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
			$(obj).on('click', trigger, click);
			function click(e) {
				return fn.call(this, e);
			}
		},
		bindEvent: function() {
			var _this = this;
			var start = {},
				istartleft = 0,
				end = {},
				move = false;
			var curPos = {};
			this.content.on('touchstart', function(e) {
				start = {
					x: e.changedTouches[0].pageX
				};
				if (e.targetTouches.length == 2) {
					move = false;
					return false;
				};
				curPos = $(this).position();
				istartleft = start.x;
				clearInterval(_this.interval);
			}).on('touchmove', function(e) {
				if (e.targetTouches.length == 2) {
					return false;
				}
				move = true;
				end = {
					x: e.changedTouches[0].pageX
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
						left: curPos.left + (end.x - start.x)
					}
					$(this).css(curPos);
				}
				start = end;
				return false;
			}).on('touchend', function(e) {
				end = {
					x: e.changedTouches[0].pageX
				};
				var curPos = $(this).position();
				var stopPos = {
					left: curPos.left + (end.x - start.x)
				};
				$(this).css(stopPos);
				if (end.x > istartleft) {
					_this.index--;
				} else {
					_this.index++;
				}
				_this.go();
				move = false;
				_this.auto();
				return false;
			});
			_this.touch(_this.num,"i",  function() {
				clearInterval(_this.interval);
				_this.index = $(this).index();
				_this.go();
				_this.auto();
			});
		},
		formatNum: function() {
			if (this.num) {
				var html = '';
				for (var i = 0, l = this.list.length; i < l; i++) {
					var item = this.list[i];
					var cls = '';
					if (this.index == i) {
						cls = 'current';
					}
					html += '<i class="' + cls + '">' + (i + 1) + '</i>';
				};
				this.num.html(html);
			}
		},
		go: function() {
			var _this = this;
			if (_this.index >= _this.size) {
				_this.index = _this.size - 1;
			}
			if (_this.index < 0) {
				_this.index = 0
			}
			var step = _this.step;
			var left = -_this.index * step;
			_this.content.animate({
				left: left
			}, _this.animate, $.proxy(_this.formatNum, _this));
		},
		auto: function() {
			var _this = this;
			this.interval = setInterval(function() {
				_this.index++;
				if (_this.index >= _this.size) {
					_this.index = 0;
				}
				_this.go();
			}, this.timer);
		}
	}
	return CarouselImage;
});