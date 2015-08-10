/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-06-12
 * Time: 17:34:25
 * Contact: 55342775@qq.com
 */
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Tip = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.Tip = function(settings) {
		var arr = [];
		$(this).each(function() {
			var options = $.extend({
				trigger: this
			}, settings);
			var tip = new Tip();
			tip.init(options);
			arr.push(tip);
		});
		return $(arr);
	};

	function Tip() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'Tip_' + rnd;
	}
	Tip.prototype = {
		init: function(settings) {
			this.settings = $.extend({
				trigger: '',
				status: 'hide',
				callback: null,
				tpl: '<div class="ui-tip"><div class="ui-tip-content"></div><div class="ui-tip-arrow"><i></i><em></em></div></div>',
				triggerEvent: 'hover',
				offset: {
					x: 0,
					y: 0
				},
				width: 'auto',
				height: 'auto',
				zIndex: 999,
				content: '',
				inViewport: false,
				delegate: 'body',
				position: 'right', //top||left||bottom||right
				ajax: null //deffered
			}, settings);
			this.status = this.settings.status;
			this.position = this.settings.position;
			this.bindEvent();
		},
		bindEvent: function() {
			var _this = this;
			if (this.settings.triggerEvent == 'click') {
				$(this.settings.delegate).on(this.settings.triggerEvent, this.settings.trigger, function() {
					if (_this.status == "hide") {
						_this.show();
					} else
					if (_this.status == "show") {
						_this.hide();
					}
				});
			} else
			if (this.settings.triggerEvent == "hover") {
				var hovertimer = null;
				$(this.settings.delegate).on('mouseover', this.settings.trigger, function() {
					_this.show();
					$(_this.tip).hover(function() {
						clearTimeout(hovertimer);
					}, function() {
						_this.hide();
					});
				}).on('mouseout', this.settings.trigger, function() {
					hovertimer = setTimeout(function() {
						_this.hide();
					}, 500)
				});
			} else {
				$(this.settings.trigger).on(this.settings.triggerEvent, function() {
					_this.show();
				});
			}
		},
		show: function() {
			var _this = this;
			if (!this.tip) {
				this.tip = $(this.settings.tpl);
				this.tipcontent = this.tip.find('.ui-tip-content');
				this.tiparrow = this.tip.find('.ui-tip-arrow');
				$('body').append(this.tip);
			}
			this.tip.show().css({
				zIndex: this.settings.zIndex
			});
			this.tipcontent.css({
				height: this.settings.height,
				width: this.settings.width
			});
			this.setContent(this.settings.content);
			if (this.settings.ajax) {
				this.settings.ajax().done(function(content) {
					_this.setContent(content);
				})
			}
			this.setPosition();
			this.status = 'show';
			this.start();
			this.settings.callback && this.settings.callback.call(this);
		},
		hide: function() {
			this.tip.remove();
			this.tip = null;
			this.status = 'hide';
			this.stop();
		},
		start: function() {
			var _this = this;
			$(window).resize(function() {
				_this.setPosition();
			}).scroll(function() {
				_this.setPosition();
			});
			this._timer && clearInterval(this._timer);
			this._timer = setInterval(function() {
				_this.setPosition();
			}, 50);
		},
		stop: function() {
			clearInterval(this._timer);
			$(window).off("resize").off('scroll');
		},
		setPosition: function(b) {
			var _this = this;
			if (!this.tip || this.tip.size() == 0) return;
			var targetPos = $(_this.settings.trigger).offset();
			var targetWH = {
				h: $(_this.settings.trigger).outerHeight(),
				w: $(_this.settings.trigger).outerWidth()
			};
			var tipWH = {
				w: this.tip.outerWidth(),
				h: this.tip.outerHeight()
			}
			var winXY = {
				y: $(window).scrollTop(),
				x: $(window).scrollLeft()
			};
			var winWH = {
				w: $(window).width(),
				h: $(window).height()
			};
			this.tip.attr('class', 'ui-tip');
			switch (_this.position) {
				case "left":
					{
						this.tip.x = targetPos.left - tipWH.w + _this.settings.offset.x - 10;
						this.tip.y = targetPos.top + _this.settings.offset.y;
						this.tip.css({
							left: this.tip.x,
							top: this.tip.y
						});
						this.tip.addClass('arrow-left');
						if (this.tip.x - winXY.x < 0 && !b) {
							this.stop();
							this.position = "right";
							this.setPosition(true);
						}
					}
					break;
				case "top":
					{
						this.tip.x = targetPos.left - (tipWH.w - targetWH.w) / 2
						this.tip.y = targetPos.top - tipWH.h + _this.settings.offset.y - 10;
						this.tip.css({
							left: this.tip.x,
							top: this.tip.y
						});
						this.tip.addClass('arrow-top');
						if (this.tip.y < winXY.y && !b) {
							this.stop();
							this.position = "bottom";
							this.setPosition(true);
						}
					}
					break;
				case "bottom":
					{
						this.tip.x = targetPos.left - (tipWH.w - targetWH.w) / 2
						this.tip.y = targetPos.top + targetWH.h + _this.settings.offset.y + 10
						this.tip.css({
							left: this.tip.x,
							top: this.tip.y
						});
						this.tip.addClass('arrow-bottom');
						if (this.tip.y + this.tip.height() > winWH.h + winXY.y && !b) {
							this.stop();
							this.position = "top";
							this.setPosition(true);
						}
					}
					break;
				default:
					{ //right
						this.tip.x = targetWH.w + targetPos.left + _this.settings.offset.x + 10;
						this.tip.y = targetPos.top + _this.settings.offset.y;
						this.tip.css({
							left: this.tip.x,
							top: this.tip.y
						});
						this.tip.addClass('arrow-right');
						if (this.tip.x + this.tip.outerWidth() > winXY.x + winWH.w && !b) {
							this.stop();
							this.position = "left";
							this.setPosition(true);
						}
					}
					break;
			}
		},
		setContent: function(content) {
			this.tipcontent.html(content);
			this.setPosition();
		}
	}
	return Tip;
});