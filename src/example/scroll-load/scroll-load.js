/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-26
 * Time: 14:39:30
 * Contact: 55342775@qq.com
 */
function ScrollLoad() {
	this.container;
	this.url;
	this.param;
	this.page = 1;
	this.pagename = 'page'
	this.loadmore;
};
ScrollLoad.prototype = {
	init: function(settings) {
		this.settings = $.extend({}, settings);
		this.load = this.settings.loadmore || $('<div class="ui-loading">点击加载更多</div>');
		this.container = this.settings.container;
		if (this.container.children().size() == 0) {
			this.container.append('<div class="scroll-content"/>');
		}
		this.container.append(this.load);
		this.url = this.settings.url;
		this.page = this.settings.page || 1;
		this.pagename = settings.pagename || 'page';
		this.param = $.extend({}, this.settings.param);
		this.param[this.pagename] = this.page;
		this.bindEvent();
		this.checkPosition();
	},
	touch: function(obj, fn) {
		var move;
		$(obj).on('click', fn);
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
	bindEvent: function() {
		if (this.container.size()) {
			var _this = this;
			if(_this.settings.scrollLoad){
				$(window).scroll(function() {
					_this.checkPosition();
				});
			}
			_this.touch(_this.load, function() {
				_this.ajaxData();
			});
		}
	},
	checkPosition: function() {
		var offset = this.container.offset();
		var height = this.container.height();
		var clientHeight = window.innerHeight || document.documentElement.clientHeight; //可视区域
		var clientWidth = window.innerWidth || document.documentElement.clientWidth;
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		var _this = this;
		if (offset.top + height <= clientHeight + scrollTop) {
			_this.ajaxData();
		}
	},
	ajaxData: function() {
		var _this = this;
		if (_this.ajax) {
			return false;
		}
		_this.ajax = true;
		this.load.html('正在加载中...');
		this.param[this.pagename] = this.page;
		$.ajax({
			url: _this.url,
			type: _this.settings.type || "get",
			dataType: "json",
			cache: false,
			data: _this.param,
			timeout: 30000,
			success: function(result) {
				if (_this.settings.format) {
					_this.settings.format(this.container, result);
				} else {
					_this.format(result);
				};
				_this.page++;
			},
			complete: function() {
				setTimeout(function() {
					_this.ajax = false;
				}, 1000);
				_this.load.html('点击加载更多');
			}
		});
	},
	format: function(result) {
		if (!(result.data && result.data.length)) {
			result.nodata = true;
			this.load.remove();
		};
		var tpl = typeof this.settings.tpl === "string" ? $(this.settings.tpl) : this.settings.tpl;
		var source = tpl.html();
		var template = Handlebars.compile(source);
		var html = template(result);
		this.container.children().first().append(html)
		this.settings.callback && this.settings.callback(this.container, result);
	}
};