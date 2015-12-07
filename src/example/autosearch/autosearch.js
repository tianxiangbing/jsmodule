/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-07-20
 * Time: 15:10:00
 * Contact: 55342775@qq.com
 */

;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.AutoSearch = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	function AutoSearch() {}
	AutoSearch.prototype = {
		init: function(settings) {
			var rnd = Math.random().toString().replace('.', '');
			this.id = 'autosearch_' + rnd;
			this.settings = $.extend({
				mutil: false
			}, settings);
			this.input = $(this.settings.input);
			this.min = this.settings.min || 1;
			this.data = this.settings.data;
			this.valueObj = $(this.settings.valueObj || this.settings.input); //赋值项
			this.valueName = this.settings.valueName || 'name';; //赋值项
			this.target = $(this.settings.target || this.settings.input); //显���框
			this.filterColumn = this.settings.filterColumn || ['name'];
			this.column = this.settings.column || ['name'];
			this.timer = null;
			this.content = null;
			this.ischanged = false;
			this.mutilValueArr = [];
			this.mutilTextArr = [];
			this.createContent();
			this.bindEvent();
		},
		bindEvent: function() {
			var _this = this;
			this.target.click(function() {
				if (_this.settings.autoShow) {
					_this.search();
				}
				return false;
			});
			this.input.on('focus', function() {
				var input = $(this);
				_this.timer && clearInterval(_this.timer);
				_this.timer = setInterval(function() {
					if (input.data('old') != input.val()) {
						_this.search();
						input.data('old', input.val());
					}
				}, 25);
				_this.settings.focusCallback && _this.settings.focusCallback.call(_this, _this.input);
			}).on('keyup', function(e) {
				var input = $(this);
				if (input.data('old') != input.val() && e.keyCode != 13) {
					_this.search();
					input.data('old', input.val());
				}
				//console.log(e.keyCode)
			}).on('blur', function() {
				if (_this.timer) {
					clearInterval(_this.timer);
				}
				setTimeout(function() {
					_this.hide();
					if (_this.ischanged && !this.settings.mutil) {
						_this.input.val('');
						_this.settings.resetCallback && _this.settings.resetCallback.call(_this, _this.input);
					}
				}, 500)
				_this.settings.blurCallback && _this.settings.blurCallback.call(_this, _this.input);
			}).on('keyup', function(e) {
				switch (e.keyCode) {
					case 40:
						{
							//down
							var i = $('.item.current', _this.content).index();
							i++;
							i = Math.min($('.item', _this.content).size() - 1, i);
							var current = $('.item.current', _this.content);
							$('.item', _this.content).removeClass('current').eq(i).addClass('current');
							if (current.size()) {
								var pos = $('.item.current', _this.content).position();
								var ch = current.outerHeight();
								if (pos.top + ch > $(_this.content).height()) {
									var st = $(_this.content).scrollTop();
									st += ch;
									$(_this.content).scrollTop(st);
								}
							}
						}
						break;
					case 38:
						{
							//up
							var i = $('.item.current', _this.content).index();
							i--;
							i = Math.max(0, i);
							$('.item', _this.content).removeClass('current').eq(i).addClass('current');
							var current = $('.item.current', _this.content);
							if (current.size()) {
								var pos = $('.item.current', _this.content).position();
								var ch = current.outerHeight();
								var st = $(_this.content).scrollTop();
								if (pos.top <= 0) {
									st -= ch;
									$(_this.content).scrollTop(Math.max(st, 0));
								}
							}
						}
						break;
					case 13:
						{
							//enter
							$('.item.current', _this.content).trigger('click');
							setTimeout(function() {
								_this.hide();
							}, 50)
						}
				}
			}).on('keydown', function(e) {
				if (e.keyCode == 13) {
					e.preventDefault();
				}
			});
			this.content.on('click', '.item', function() {
				var data = $(this).data('data');
				var text = $(this).text();
				if (_this.settings.mutil == true) {
					_this.mutilTextArr.push(text);
					_this.mutilValueArr.push(data[_this.valueName]);
					_this.input.val(_this.mutilTextArr.join(',') + ',');
					_this.valueObj.val(_this.mutilValueArr.join(',') + ',');
					_this.input.attr('data-value', _this.input.attr('data-value'));
				} else {
					_this.input.val(text);
					_this.valueObj.val(data[_this.valueName]);
					_this.input.attr('data-value', data[_this.valueName]);
				}
				_this.ischanged = false;
				_this.settings.callback && _this.settings.callback.call(_this, data);
				_this.hide();
			}).on('mouseover', '.item', function() {
				$(this).addClass('current').siblings().removeClass('current');
			})
			$(document).click(function() {
				_this.hide();
			});
		},
		createContent: function() {
			if ($('#' + this.id).size() == 0) {
				this.content = $('<div id="' + this.id + '" class="ui-autosearch-content"/>');
				this.content.hide();
				$('body').append(this.content);
			}
		},
		show: function() {
			var _this = this;
			_this.content.show();
			_this.content.css({
				position: 'absolute',
				zIndex: _this.settings.zIndex || 999,
				width: _this.input.outerWidth()
			});
			_this.setPostion();
			_this.postimer = setInterval(function() {
				_this.setPostion();
			}, 20);
			_this.settings.showCallback && _this.settings.showCallback.call(_this, _this.input, _this.content);
		},
		hide: function() {
			this.postimer && clearInterval(this.postimer);
			this.content.hide();
		},
		search: function() {
			var _this = this;
			var value = _this.input.val().split(',').pop();
			if (value.length >= _this.min || _this.settings.autoShow) {
				if (typeof _this.data === "function") {
					//ajax
					_this.getData();
				} else {
					var data = _this.filter(_this.data);
					_this.format(data);
					_this.show();
				}
			} else {
				_this.hide();
			}
		},
		getData: function() {
			var _this = this;
			this.settings.data(function(data) {
				_this.format(data);
				_this.show();
			});
		},
		format: function(data) {
			this.content.html('');
			if (data) {
				for (var i = 0, l = data.length; i < l; i++) {
					var item = data[i];
					var row = $();
					if (this.settings.format) {
						row = $(this.settings.format.call(this, item));
					} else {
						var name = '';
						for (var j = 0, len = this.column.length; j < len; j++) {
							name += '<span class="' + this.column[j] + '">' + item[this.column[j]] + '</span>';
						};
						row = $('<div class="item">' + name + '</div>');
					}
					row.data('data', item)
					this.content.append(row);
				};
				this.ischanged = true;
			}
		},
		filter: function(data) {
			var _this = this;
			var value = _this.input.val().split(',').pop();
			var newData = [];
			for (var i = 0, l = data.length; i < l; i++) {
				var item = data[i];
				for (var j = 0, len = this.filterColumn.length; j < len; j++) {
					var v = item[this.filterColumn[j]];
					if (v.toString().indexOf(value) != -1) {
						newData.push(item);
					}
				}
			}
			return newData;
		},
		setPostion: function() {
			var _this = this;
			var offset = _this.input.offset();
			_this.content.css({
				top: offset.top + _this.input.outerHeight(),
				left: offset.left
			});
		}
	}
	return AutoSearch;
});