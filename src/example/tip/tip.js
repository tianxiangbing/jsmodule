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
				inViewport: true,
				delegate: null,
				position: 'right', //top||left||bottom||right,bottom|left/center/right
				ajax: null //deffered
			}, settings);
			this.status = this.settings.status;
			this._getPos();
			this.bindEvent();
		},
		_getPos: function() {
			this.position = this.settings.position.split('|')[0];
			this.arrowPosition = this.settings.position.split('|')[1] || "center";
		},
		bindEvent: function() {
			var _this = this;
			var delegate = this.settings.delegate;
			var trigger = this.settings.trigger;
			if (!delegate) {
				delegate = this.settings.trigger;
				trigger = null;
			}
			if (this.settings.triggerEvent == 'click') {
				$(delegate).on(this.settings.triggerEvent, trigger, function() {
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
				$(delegate).on('mouseover', trigger, function() {
					_this.show();
					$(_this.tip).hover(function() {
						clearTimeout(hovertimer);
					}, function() {
						_this.hide();
					});
				}).on('mouseout', trigger, function() {
					hovertimer = setTimeout(function() {
						_this.hide();
					}, 500)
				});
			} else if (this.settings.triggerEvent) {
				$(this.settings.trigger).on(this.settings.triggerEvent, function() {
					_this.show();
				});
			}
		},
		show: function() {
			var _this = this;
			this.settings.beforeShow && this.settings.beforeShow.call(this);
			if (!this.tip) {
				this.tip = $(this.settings.tpl);
				this.tipcontent = this.tip.find('.ui-tip-content');
				this.tiparrow = this.tip.find('.ui-tip-arrow');
				$('body').append(this.tip);
				this.tip.on('hide', function() {
					_this.hide();
				})
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
			$(this.tip).remove();
			this.tip = null;
			this.status = 'hide';
			this.stop();
			this.b = false;
			this._getPos();
			this.settings.afterHide && this.settings.afterHide.call(this);
		},
		start: function() {
			var _this = this;
			$(window).resize(function() {
				_this._getPos();
				_this.b = false;
				_this.setPosition();
			}).scroll(function() {
				_this._getPos();
				_this.b = false;
				_this.setPosition();
			});
			this._timer && clearInterval(this._timer);
			this._timer = setInterval(function() {
				_this.setPosition();
			}, 100);
		},
		setPosition: function() {
			var b = this.b;
			var _this = this;
			if (!this.tip || this.tip.size() == 0) return;
			if($(this.settings.trigger).filter(':visible').size()==0){
				this.tip.hide();
				return false;
			}else if(this.tip){
				this.tip.show();
			}
			var targetPos = $(_this.settings.trigger).offset();
			var targetWH = {
				h: $(_this.settings.trigger).outerHeight(),
				w: $(_this.settings.trigger).outerWidth()
			};
			var tipWH = {
				w: this.tip.outerWidth(),
				h: this.tip.outerHeight()
			}
			this.tip.attr('class', 'ui-tip');
			switch (_this.position) {
				case "left":
					{
						var y = 0,
							arrowy = 0;
						if (this.arrowPosition == "top") {
							y = +_this.settings.offset.y;
							arrowy = 10;
						} else if (this.arrowPosition == "bottom") {
							y = _this.settings.offset.y - tipWH.h + targetWH.h;
							arrowy = tipWH.h - 22;
						} else {
							y = _this.settings.offset.y - (tipWH.h - targetWH.h) / 2;
							arrowy = tipWH.h / 2 - 6;
						}
						this.tiparrow.y = arrowy;
						this.tiparrow.x = tipWH.w - 2;
						this.tip.x = targetPos.left - tipWH.w + _this.settings.offset.x - 10;
						this.tip.y = targetPos.top + _this.settings.offset.y + y;
						this.tip.addClass('arrow-left');
						this._overScreen();
					}
					break;
				case "top":
					{
						var x = 0,
							arrowx = 0;
						if (this.arrowPosition == "left") {
							x = 0;
							arrowx = 10;
						} else if (this.arrowPosition == "right") {
							x = +targetWH.w - tipWH.w;
							arrowx = tipWH.w - 22;
						} else {
							x = -(tipWH.w - targetWH.w) / 2;
							arrowx = tipWH.w / 2 - 6;
						}
						this.tiparrow.y = tipWH.h - 2;
						this.tiparrow.x = arrowx;
						this.tip.x = targetPos.left + x;
						this.tip.y = targetPos.top - tipWH.h + _this.settings.offset.y - 10;
						this.tip.addClass('arrow-top');
						this._overScreen();
					}
					break;
				case "bottom":
					{
						var x = 0,
							arrowx = 0;
						if (this.arrowPosition == "left") {
							x = 0;
							arrowx = 10;
						} else if (this.arrowPosition == "right") {
							x = +targetWH.w - tipWH.w;
							arrowx = tipWH.w - 22;
						} else {
							x = -(tipWH.w - targetWH.w) / 2;
							arrowx = tipWH.w / 2 - 6;
						}
						this.tiparrow.y = -6;
						this.tiparrow.x = arrowx;
						this.tip.x = targetPos.left + x;
						this.tip.y = targetPos.top + targetWH.h + _this.settings.offset.y + 10
						this.tip.addClass('arrow-bottom');
						this._overScreen();
					}
					break;
				default:
					{ //right

						var y = 0,
							arrowy = 0;
						if (this.arrowPosition == "top") {
							y = +_this.settings.offset.y;
							arrowy = 10;
						} else if (this.arrowPosition == "bottom") {
							y = _this.settings.offset.y - tipWH.h + targetWH.h;
							arrowy = tipWH.h - 22;
						} else {
							y = _this.settings.offset.y - (tipWH.h - targetWH.h) / 2;
							arrowy = tipWH.h / 2 - 6;
						}
						this.tip.x = targetWH.w + targetPos.left + _this.settings.offset.x + 10;
						this.tip.y = targetPos.top + y;
						this.tip.addClass('arrow-right');
						this.tiparrow.y = arrowy;
						this.tiparrow.x = -6;
						this._overScreen();
					}
					break;
			}
			if (!this.settings.inViewport) {
				this._setPosition();
			}
		},
		stop: function() {
			clearInterval(this._timer);
			$(window).off("resize").off('scroll');
		},
		_overScreen: function() {
			var winXY = {
				y: $(window).scrollTop(),
				x: $(window).scrollLeft()
			};
			var winWH = {
				w: $(window).width(),
				h: $(window).height()
			};
			if (this.settings.inViewport && !this.b) {
				this.b = true;
				if (this.tip.x - winXY.x < 0) {
					if (this.position == "left") {
						this.position = "right";
					} else {
						this.arrowPosition = "left";
					}
				}
				if (this.tip.y < winXY.y) {
					if (this.position == "top") {
						this.position = "bottom";
					} else {
						this.arrowPosition = "top";
					}
				}
				if (this.tip.y + this.tip.outerHeight() > winWH.h + winXY.y) {
					if (this.position == "bottom") {
						this.position = "top";
					} else {
						this.arrowPosition = "bottom";
					}
				}
				if (this.tip.x + this.tip.outerWidth() > winXY.x + winWH.w) {
					if (this.position == "right") {
						this.position = "left";
					} else {
						this.arrowPosition = "right";
					}
				}
				this.setPosition();
			}
			this._setPosition();
		},
		_setPosition: function() {
			this.tip.css({
				left: this.tip.x,
				top: this.tip.y
			});
			this.tiparrow.css({
				top: this.tiparrow.y,
				left: this.tiparrow.x
			});
		},
		setContent: function(content) {
			this.tipcontent.html(content);
			this.setPosition();
		}
	}
	return Tip;
});