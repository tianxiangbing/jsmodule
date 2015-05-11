/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-05-08
 * Time: 17:20:55
 * Contact: 55342775@qq.com
 */
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.WordCount = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.WordCount = function(settings) {
		var list = [];
		$(this).each(function() {
			var word = new WordCount();
			var options = $.extend({
				trigger: $(this)
			}, settings);
			word.init(options);
			list.push(word);
		});
		return list;
	};

	var WordCount = function() {};
	WordCount.prototype = {
		init: function(args) {
			var _self = this;
			this.args = args;
			this.textBox = $(args.trigger);
			this.settings = $.extend({}, args);
			this.oldNumber = 0;
			this.minHeight = args.minHeight;
			this.number = 0;
			this.timer = null;
			this.overClass = args.overClass || "";
			this.changeCallback = args.changeCallback || null;
			this.max = 0;
			this.overflowCallback = args.overflowCallback || null;
			this.passClallback = args.passClallback || null;
			this.isOverflowCut = args.isOverflowCut || true;
			_self.withButton = $(args.withButton);
			this.num = $(args.num);
			_self.max = args.max || parseInt(_self.textBox.attr("maxLength")) || 0;
			_self.textBox.bind('focus', function() {
				_self.start();
			}).bind("blur", function(e) {
				clearInterval(_self.timer);
			});
			this.bindEvent();
			this.checkNum();
		},
		bindEvent: function() {
			var _self = this;
			this.touch(this.withButton, function() {
				_self.getFullNumber();
				if (_self.max && _self.number > _self.max) {
					_self.twinkle().done(function() {
						_self.twinkle();
					});
					return false;
				}
				return true;
			});
		},
		twinkle: function() {
			var _self = this;
			var t = null;
			setTimeout(function() {
				_self.textBox.addClass('error-number');
				setTimeout(function() {
					_self.textBox.removeClass('error-number');
					t && t();
				}, 100);
			}, 100);
			return {
				done: function(f) {
					t = f;
				}
			}
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
			$(obj).on('mousedown', trigger, click);

			function click(e) {
				return fn.call(this, e);
			}
		},
		start: function() {
			var _self = this;
			_self.timer = setInterval(function() {
				_self.checkNum();
			}, 20);
		},
		checkNum: function() {
			var _self = this;
			_self.getFullNumber();
			if (_self.number !== _self.oldNumber && _self.changeCallback) {
				if (_self.max && _self.number > _self.max) {
					if (_self.overflowCallback) {
						_self.num.addClass(_self.overClass);
						_self.textBox.addClass(_self.overClass).attr('data-overflow', true);
						_self.overflowCallback(_self, _self.number, _self.textBox, _self.max);
					} else if (_self.isOverflowCut) {
						_self.textBox.val(_self.textBox.val().slice(0, _self.max));
						_self.getFullNumber();
					}
				} else {
					_self.num.removeClass(_self.overClass);
					_self.textBox.removeClass(_self.overClass).attr('data-overflow', '');
					_self.passClallback && _self.passClallback.call(_self, _self.number, _self.textBox, _self.max);
				}
				_self.num.html(_self.max - _self.number);
				_self.changeCallback.call(_self, _self.number);
			}
			_self.oldNumber = _self.number;
			if(_self.settings.minHeight){
				_self.textBox.height(_self.minHeight);
				_self.textBox.height(_self.textBox[0].scrollHeight);
			}
		},
		getNumber: function() {
			if (this.args.isByte) {
				this.number = this.textBox.val().replace(/[^\x00-\xff]/g, "**").length;
			} else {
				this.number = this.textBox.val().length;
			}
			return this.number;
		},
		getFullNumber: function() {
			this.number = this.textBox.val().replace(/[^\x00-\xff]/g, "**").length;
			return this.number;
		}
	};
	return WordCount;
});