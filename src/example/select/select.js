/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/select
 * User: 田想兵
 * Date: 2015-08-11
 * Time: 11:34:25
 * Contact: 55342775@qq.com
 */
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Select = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	$.fn.Select = function(settings) {
		var arr = [];
		$(this).each(function() {
			var options = $.extend({
				target: this,
				maxHeight: 200,
				maxWidth: null,
				disabled: false
			}, settings);
			var select = new Select();
			select.init(options);
			arr.push(select);
		});
		return $(arr);
	};

	function Select() {
		var rnd = Math.random().toString().replace('.', '');
		this.id = 'sel_' + (+new Date()).toString().substr(-8) + rnd;
	}
	Select.prototype = {
		init: function(settings) {
			this.settings = $.extend({
				target: null,
				selected: null,
				model: null,
				multi: false,
				disabled: false
			}, settings);
			this.target = $(this.settings.target);
			this.model = $.extend([], this.settings.model);
			this.create();
			this.bindEvent();
		},
		create: function() {
			this.w = this.settings.width || this.target.outerWidth();
			this.h = this.settings.height || this.target.outerHeight();
			this.trigger = $('<div class="ui-select-trigger"><span></span><i></i></div>');
			var clsname = this.target.attr('class');
			this.trigger.addClass(clsname)
			this.trigger.width(this.w);
			this.trigger.height(this.h).css('lineHeight', this.h + 'px');
			if (this.settings.disabled || this.target.hasClass('disabled') || this.target.attr('disabled') == 'disabled') {
				this.trigger.addClass('ui-select-disabled');
				this.disabled = true;
			}
			this.target.after(this.trigger);
			var arrow = this.trigger.find('i');
			arrow.css({
				top: (this.h - arrow.outerHeight() / 2) / 2
			});
			this.select = $('<div id="' + this.id + '" class="ui-select"><ul class="ui-select-content"></ul></div>');
			$('body').append(this.select);
			this.selectContent = this.select.children('ul');
			this.format();
			this.target.hide();
		},
		setData: function(model) {
			this.model = model;
			this.format();
		},
		render: function() {
			this.format();
		},
		format: function() {
			var _this = this;
			if (!this.settings.model && this.model.length == 0) {
				this.model = [];
				this.target.find('option').each(function() {
					var o = {
						value: $(this).attr('value'),
						text: $(this).html(),
						disabled: $(this).attr('disabled')
					};
					_this.model.push(o);
				});
			} else {
				//format select
				var _html = "";
				for (var i = 0, l = _this.model.length; i < l; i++) {
					var item = _this.model[i];
					var dis = item.disabled ? ' disabled="true" ' : ''
					_html += '<option ' + dis + ' value="' + _this.escape(item.value) + '">' + _this.escape(item.text) + '</option>'
				}
				if (this.target.get(0).nodeName == "SELECT") {
					this.target.html(_html);
				}
			}
			var str = '';
			for (var i = 0, l = _this.model.length; i < l; i++) {
				var item = _this.model[i];
				var cls = '';
				if (item.disabled) {
					cls += ' ui-select-item-disabled';
				}
				str += '<li class="' + cls + '" data-text="' + _this.escape(item.text) + '" data-value="' + _this.escape(item.value) + '" title="' + _this.escape(item.text) + '">' + item.text + '</li>';
			}
			_this.selectContent.html(str);
			_this.selectContent.children('li').height(_this.h).css('lineHeight', _this.h + 'px');
			var v = this.target.val();
			if (typeof this.target[0].value == 'undefined') {
				v = this.target.data('value');
			}
			_this.value = v;
			this.setValue(v);
		},
		escape: function(v) {
			return v.toString().replace(/\'/igm, "&apos;").replace(/\"/igm, "&quot;")
		},
		setValue: function(val, txt) {
			var _this = this;
			this.selectContent.find('li').each(function() {
				if ($(this).data('value') == val) {
					var txt = txt || $(this).data('text');
					_this.trigger.children('span').attr('title', txt).text(txt);
					_this.trigger.attr('data-value', val);
					_this.target.val(val);
					_this.target.attr('data-value', val);
					_this.target.attr('data-text', txt);
					$(this).addClass('ui-select-item-selected').siblings().removeClass('ui-select-item-selected');
					if (_this.value != val) {
						_this.settings.selected && _this.settings.selected.call(_this, val, txt);
						_this.target.trigger('change', val);
					}
					_this.value = val;
					return;
				}
			})
		},
		bindEvent: function() {
			var _this = this;
			_this.status = false;
			this.trigger.on('click', function() {
				if (!_this.disabled) {
					$('.ui-select').not('#' + _this.id).trigger('hide');
					if (!_this.status) {
						_this.show();
					} else {
						_this.hide();
					}
				}
				return false;
			});
			_this.target.on('set',function(e,v){
				_this.setValue(v)
			});
			this.select.on('click', 'li', function() {
				if (!$(this).hasClass('ui-select-item-disabled')) {
					var val = $(this).data('value');
					var txt = $(this).data('text')
					_this.setValue(val, txt);
					_this.hide();
				}
				return false;
			});
			this.select.on('hide', function() {
				_this.hide();
			});
			$(document).click(function() {
				_this.hide();
			})
		},
		show: function() {
			this.settings.beforeShow && this.settings.beforeShow.call(this, this.trigger, this.target);
			this.trigger.addClass('active');
			var pos = this.trigger.offset();
			this.select.css({
				left: pos.left,
				top: pos.top + this.h
			}).css({
				maxHeight: this.settings.maxHeight,
				maxWidth: this.settings.maxWidth || this.w,
				minWidth: this.w
			}).show();
			this.status = true;
		},
		hide: function() {
			this.trigger.removeClass('active');
			this.status = false;
			this.select.hide();
			this.target.trigger('blur');
		}
	}
	return Select;
});