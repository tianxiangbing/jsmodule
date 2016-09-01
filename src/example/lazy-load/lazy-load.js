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
		root.LazyLoad = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.LazyLoad = function(settings) {
		var ll = new LazyLoad();
		var options = $.extend({
			elements: $(this)
		}, settings);
		ll.init(options);
		return ll;
	};

	function LazyLoad() {
		this.loadImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC';
		this.settings = {
			container: window,
			effect: 'show',
			effectArgs: null,
			elements: null,
			load: null,
			offset: 0,
			event: 'scroll'
		};
	}
	LazyLoad.prototype = {
		init: function(settings) {
			this.settings = $.extend(this.settings, settings);
			this.elements = $(this.settings.elements);
			this.loadImg = this.settings.loadImg || this.loadImg;
			this.loadDom = this.settings.loadDom;
			this.bindEvent();
			if (this.settings.event == "scroll") {
				this.load();
			}
			this.initImg();
		},
		initImg: function() {
			var _this = this;
			this.elements.each(function() {
				var $this = $(this);
				if (($this.attr('src') === undefined || $this.attr('src') === false || $this.attr('src') == "") && $this.is('img')) {
					$this.attr('src', _this.loadImg);
					if(_this.settings.loadDom){
						var loadDom = $(_this.settings.loadDom).clone();
						$this.parent().append(loadDom);
						loadDom.parent().css('position','relative');
						loadDom.css({
							'position':'absolute',
							'top':$this.position().top,
							'left':$this.position().left,
							width:'100%',
							height:'100%',
							"text-align": "center"
						}).prop('class','load-dom');
					}
				}
			})
		},
		bindEvent: function() {
			var container = $(this.settings.container);
			var _this = this;
			container.on(_this.settings.event, function() {
				_this.load();
			});
			$(window).on('resize', function() {
				_this.load();
			});
		},
		load: function() {
			var _this = this;
			this.elements.each(function() {
				if (this.loaded) {
					return;
				}
				if (_this.checkPosition(this)) {
					_this.show(this);
				}
				_this.settings.load && _this.settings.load.call(_this, this)
			});
		},
		checkPosition: function(img) {
			var offsetTop = $(img).offset().top;
			var clientHeight = window.clientHeight || document.documentElement.clientHeight || document.body.clientHeight; //可视区域
			var clientWidth = window.clientWidth || document.documentElement.clientWidth || document.body.clientWidth;
			var scrollTop = $(window).scrollTop();
			if (offsetTop + this.settings.offset <= clientHeight + scrollTop) {
				return true;
			}
			return false;
		},
		show: function(img) {
			var _this = this;
			var $this = $(img);
			var self = img;
			self.loaded = false;
			var original = $this.attr('data-src');
			$('<img/>').attr('src', original).on('load', function() {
				self.loaded = true;
				$this.hide();
				if ($this.is('img')) {
					$this.attr('src', original);
				} else {
					$this.css('background-image', "url('" + original + "')");
				}
				console.log($this.siblings('.load-dom'))
				$this.siblings('.load-dom').remove();
				$this[_this.settings.effect](_this.settings.effectArgs);
			});
		}
	}
	return LazyLoad;
});