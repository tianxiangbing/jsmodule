/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-16
 * Time: 20:27:54
 * Contact: 55342775@qq.com
 */
function Dialog() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'dialog_' + rnd;
	this.settings = {};
	this.settings.closeTpl = $('<span class="ui-dialog-close js-dialog-close">x</span>');
	this.settings.titleTpl = $('<div class="ui-dialog-title"></div>');
}
Dialog.prototype = {
	init: function(settings) {
		var _this = this;
		this.settings = $.extend({}, this.settings, settings);
		if (this.settings.mask) {
			this.mask = $('<div class="ui-dialog-mask"/>');
			$('body').append(this.mask);
		}
		$('body').append('<div class="ui-dialog" id="' + this.id + '"></div>');
		this.dialogContainer = $('#' + this.id);
		var zIndex = this.settings.zIndex || 10;
		this.dialogContainer.css({
			'zIndex': zIndex
		});
		this.mask.css({
			'zIndex': zIndex - 1
		});
		if (this.settings.closeTpl) {
			this.dialogContainer.append(this.settings.closeTpl);
		}
		if (this.settings.title) {
			this.dialogContainer.append(this.settings.titleTpl);
			this.settings.titleTpl.html(this.settings.title);
		}
		this.bindEvent();
		if (this.settings.show) {
			this.show();
		}
	},
	bindEvent: function() {
		var _this = this;
		if (this.settings.trigger) {
			$(this.settings.trigger).click(function() {
				_this.show();
			});
		};
		$(this.dialogContainer).delegate('.js-dialog-close', 'click', function() {
			_this.hide();
			return false;
		})
		$(window).resize(function() {
			_this.setPosition();
		});
		$(window).scroll(function() {
			_this.setPosition();
		})
		$(window).keydown(function(e) {
			if (e.keyCode === 27) {
				_this.hide();
			}
		});
	},
	hide: function() {
		var _this = this;
		if (typeof this.settings.target === "object") {
			this.dailogContent.append('body');
		}
		if (this.settings.beforeHide) {
			this.settings.beforeHide.call(this, this.dailogContent);
		}
		this.dialogContainer.removeClass('zoomIn').addClass("zoomOut");
		setTimeout(function() {
			_this.dialogContainer.hide();
		}, 500);
		this.mask.hide();
	},
	show: function() {
		if (typeof this.settings.target === "string") {
			if (/^(\.|\#\w+)/gi.test(this.settings.target)) {
				this.dailogContent = $(this.settings.target);
			} else {
				this.dailogContent = $('<div>' + this.settings.target + '</div>')
			}
		} else {
			this.dailogContent = this.settings.target;
		}
		if (this.settings.beforeShow) {
			this.settings.beforeShow.call(this, this.dailogContent);
		}
		this.mask.show();
		this.dailogContent.show();
		this.height = this.settings.height || this.dialogContainer.height();
		this.width = this.settings.width || this.dialogContainer.width();
		this.dialogContainer.append(this.dailogContent).show().css({
			height: this.height,
			width: this.width
		}).addClass('zoomIn').removeClass('zoomOut').addClass('animated');
		this.setPosition();
	},
	setPosition: function() {
		this.mask.height(document.documentElement.scrollHeight || document.body.scrollHeight);
		var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
		var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
		var top = (clientHeight - this.height) / 2 + document.body.scrollTop;
		var left = (clientWidth - this.width) / 2;
		if (left < 0) {
			left = 0;
		}
		if (top < document.body.scrollTop) {
			top = document.body.scrollTop;
		}
		this.dialogContainer.css({
			top: top,
			left: left
		})
	}
}