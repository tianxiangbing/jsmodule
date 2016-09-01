/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-05-08
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
		root.ClickProgress = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.ClickProgress = function(settings) {
		var list = [];
		$(this).each(function() {
			var car = new ClickProgress();
			var options = $.extend({
				trigger: $(this)
			}, settings);
			car.init(options);
			list.push(car);
		});
		return list;
	};

	function ClickProgress() {}
	ClickProgress.prototype = {
		init: function(settings) {
			this.settings = settings;
			this.trigger = $(settings.trigger);
			this.target = $(settings.target);
			this.v = settings.v || 10;
			this.dv = this.v; //初始速度
			this.a = settings.a || 1;
			this.da = this.a;
			this.change = settings.change || "height";
			this.time = settings.time || 30;
			if (this.change == "height") {
				this.range = $(this.target).height();
			} else {
				this.range = $(this.target).width();
			}
			this.finish = this.target.children().first();
			this.full = this.target[this.change]();
			this.power = 1;
			this.bindEvent();
		},
		touch: function(trigger, fn) {
			var move, timer;
			var _this = this;
			var istouch = false;
			if (typeof trigger === "function") {
				fn = trigger;
			};
			$(trigger).on('touchstart mousedown', function(e) {
				e.preventDefault();
				if (_this.settings.event == "press") {
					timer = setInterval(function() {
						fn.call(this, e, 'touch');
					}, 50);
				}
			}).on('touchmove', function(e) {
				e.preventDefault();
				move = true;
			}).on('touchend mouseup', function(e) {
				e.preventDefault();
				if (!move) {
					var returnvalue = fn.call(this, e, 'touch');
					if (returnvalue === false) {
						e.preventDefault();
						e.stopPropagation();
					}
				}
				move = false;
				if (_this.settings.event == 'press') {
					clearInterval(timer)
					_this.settings.callback && _this.settings.callback.call(this, _this.trigger, _this.target, _this.power);
				}
			});
			$(trigger).on('mousedown', click);

			function click(e) {
				return fn.call(this, e);
			}
		},
		bindEvent: function() {
			var _this = this;
				_this.v = _this.dv;
			this.touch(this.trigger, function() {
				if(_this.settings.event !="press"){
					_this.v = _this.dv;
				}
				_this.setup();
				_this.settings.clicked && _this.settings.clicked(_this.trigger, _this.target, _this.power);
				return false;
			});
		},
		setup: function() {
			var _this = this;
			if (this.timer) {
				//clearInterval(this.timer);
				return;
			}
			if (_this.settings.event == "press") {
				var _this = this;
				_this.power = _this.finish[_this.change]();
				_this.power += _this.v;
				_this.power = Math.max(0, _this.power);
				if (_this.power >= _this.full && _this.v > 0) {
					_this.v = _this.v * -1;
					_this.power = _this.full + _this.v;
				}
				if (_this.power <= 0 && _this.v < 0) {
					_this.v = _this.v * -1;
					_this.power = 0 + _this.v;
				}
				console.log('v:' + _this.v, "p:" + _this.power)
				_this.finish[_this.change](_this.power);
			} else {
				this.timer = setInterval(function() {
					_this.animate();
				}, this.time);
			}
		},
		animate:function(){
			var _this =this;
			_this.power = _this.finish[_this.change]();
			_this.power += _this.v;
			_this.power = Math.max(0, _this.power);
			_this.power = Math.min(_this.power, _this.full);
			_this.finish[_this.change](_this.power);
			if (_this.power == _this.full) {
				//clearInterval(_this.timer);
				_this.settings.callback && _this.settings.callback.call(this,_this.trigger, _this.target, _this.power);
			}
			_this.settings.progress && _this.settings.progress(_this.trigger, _this.target, _this.power);
			_this.a =_this.da + (1 *_this.power/ _this.full) ;
			_this.v -= _this.a;
			if (_this.power <= 0) {
				clearInterval(_this.timer);
				_this.timer = null;
			}
		}
	}
	return ClickProgress;
});