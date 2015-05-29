/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-05-13
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
		root.ImageZooming = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.ImageZooming = function(settings) {
		var arr = [];
		$(this).each(function() {
			var options = $.extend({
				target: $(this)
			}, settings);
			var lz = new ImageZooming();
			lz.init(options);
			arr.push(lz);
		});
		return arr;
	};

	function ImageZooming() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'imagezooming_' + rnd;
	}
	ImageZooming.prototype = {
		init: function(settings) {
			this.settings = $.extend({
				target: $(),
				width: 100,
				height: 100,
				always: false,
				times: 2 //放大倍数
					,
				callback: null
			}, settings);
			this.settings.target = $(this.settings.target);
			this.zoom = $('#' + this.id);
			this.bindEvent();
		},
		bindEvent: function() {
			var _this = this;
			if (this.settings.always) {
				_this.createZooming.call(_this, this.settings.target);
				var img = this.settings.target;
				var offset = $(img).offset();
				var imgh = $(img).height();
				var imgw = $(img).width();
				_this.setPosition.call(_this, img.width() / 2 + offset.left, img.height() / 2 + offset.top, img);
			}
			_this.zoom.on('touchmove', function(e) {
				return _this.event['zoommove'].call(this, e, _this);
			});
			var ismove = false;
			_this.zoom.on('mousedown', function(e) {
				ismove = true;
			});
			$('body').on('mouseup','#'+_this.id, function(e) {
				ismove = false;
				return _this.event['mouseup'].call(this, e, _this);
			});
			$('body').on('mousemove','#'+_this.id, function(e) {
				return ismove && _this.event['zoommove'].call(this, e, _this);
			});

			//target事件
			$(this.settings.target).on('touchstart',  function(e) {
				_this.event['mousedown'].call(this, e, _this);
			});
			$(this.settings.target).on('mousedown',  function(e) {
				_this.event['mousedown'].call(this, e, _this);
				ismove = true;
			});
			$(this.settings.target).on('touchmove',  function(e) {
				/*var touch = e.changedTouches[0];
				_this.setPosition.call(_this, touch.pageX, touch.pageY, this);
				return false;*/
				return _this.event['mousemove'].call(this, e, _this);
			});
			$(this.settings.target).on('mousemove',  function(e) {
				return ismove && _this.event['mousemove'].call(this, e, _this);
			});
			$(this.settings.target).on('touchend',  function(e) {
				return _this.event['mouseup'].call(this, e, _this);
			});
			$(this.settings.target).on('mouseup',  function(e) {
				return _this.event['mouseup'].call(this, e, _this);
			});
		},
		event: {
			'zoommove': function(e, _this) {
				var touch = e.changedTouches ? e.changedTouches[0] : e;
				_this.setPosition.call(_this, touch.pageX, touch.pageY, _this.settings.target);
				return false;
			},
			'mousedown': function(e, _this) {
				var touch = e.changedTouches ? e.changedTouches[0] : e;
				_this.createZooming.call(_this, this);
				_this.setPosition.call(_this, touch.pageX, touch.pageY, this);
			},
			mousemove: function(e, _this) {
				var touch = e.changedTouches ? e.changedTouches[0] : e;
				_this.setPosition.call(_this, touch.pageX, touch.pageY, this);
				return false;
			},
			mouseup: function(e, _this) {
				_this.removeZooming();
				return false;
			}
		},
		removeZooming: function() {
			if (!this.settings.always) {
				this.zoom.hide();
			}
		},
		createZooming: function(img) {
			if (this.zoom.size() === 0) {
				this.zoom = $('<div id="'+this.id+'" style="position:absolute;background:none;"/>');
				$('body').append(this.zoom);
				this.zoom.height(this.settings.height);
				this.zoom.width(this.settings.width);
				this.zoom.css({
					'background': 'url(' + $(img).attr('src') + ') no-repeat ',
					'borderRadius': this.settings.width + 'px ' + this.settings.height + 'px',
					border: '1px solid #ccc'
				});
			}
			this.zoom.show();
		},
		setPosition: function(x, y, img) {
			var offset = $(img).offset();
			var imgh = $(img).height();
			var imgw = $(img).width();
			//不能移到图片外面
			x = Math.min(x, offset.left + imgw);
			x = Math.max(x, offset.left);
			y = Math.min(y, offset.top + imgh);
			y = Math.max(y, offset.top);
			var center = {
				x: x - this.settings.width / 2,
				y: y - this.settings.height / 2
			};

			var bsize = {
				x: imgw * this.settings.times,
				y: imgh * this.settings.times
			};
			var bPos = {
				x: (x - offset.left) * this.settings.times - (this.settings.width / 2),
				y: (y - offset.top) * this.settings.times - (this.settings.height / 2)
			};
			this.zoom.css({
				left: center.x,
				top: center.y,
				'backgroundPosition': -bPos.x + 'px ' + (-bPos.y) + 'px',
				'backgroundSize': bsize.x + 'px ' + bsize.y + 'px'
			});
			this.settings.callback && this.settings.callback(center, bPos, bsize, img, this.zoom);
		}
	}
	return ImageZooming;
});