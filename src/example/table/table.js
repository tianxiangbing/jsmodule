/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-06-25
 * Time: 16:27:54
 * Contact: 55342775@qq.com
 */
;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$', 'handlebars', 'paging', 'query', 'dialog'], factory);
	} else {
		root.Table = factory($, Handlebars, Paging, Query, Dialog);
	}
})(this, function($, Handlebars, Paging, Query, Dialog) {
	Handlebars.registerHelper('equalsten', function(v1, options) {
		if (v1 % 10 == 0 && v1 != 0) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	Handlebars.registerHelper('equals', function(v1, v2, options) {
		if (v1 == v2) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	});
	Handlebars.registerHelper('formatMoney', function(str) {
		var arr = str.split('-');
		if (arr.length > 1) {
			return formatAmount.doFormat($.trim(arr[0])) + " - " + formatAmount.doFormat($.trim(arr[1]));
		} else {
			return formatAmount.doFormat($.trim(arr[0]));
		}
	});

	function Table(table, temp, page, param, search, callback, filterCon) {
		this.search = search;
		this.table = table;
		this.page = page;
		this.filterCon = filterCon;
		this.temp = temp;
		this.template = null;
		this.pageData = null;
		this.ajaxurl = table.attr('ajaxurl');
		this.ajaxDeleteItemUrl = table.attr('data-ajax-deleteitem-url')
		this.currentPage = 1;
		this._total = 0;
		this.pageSize = page.attr('pagesize') || 10;
		this.callback = callback;
		this.param = $.extend(param, {});
	}
	Table.prototype = {
		init: function(settings) {
			var source = this.temp.html();
			this.template = Handlebars.compile(source);
			this.settings = settings || {
				type: 'get'
			};
			if (this.search) {
				this.param = this.getParam(this.search.closest('.form'));
				this.bindSearch();
			}
			this.bind();
			this.event();
		},
		event: function() {
			var _this = this;
			$(this.table).bind('reload', function() {
				_this.gosearch();
			})
			this.table.delegate("tr", "click", function() {
				if ($(this).attr('href') && !$(this).hasClass('dialog')) {
					location.href = $(this).attr('href');
				}
			});
			this.table.delegate(".js-ajax", "click", function() {
				if ($(this).attr('href')) {
					var ajaxurl = $(this).attr('href');
					var param = $(this).attr('js-ajax-param') || {};
					$.post(ajaxurl, param).done(function(result) {
						//console.log(result)
						if (result.status) {
							_this.gosearch();
						} else {
							$.alert(result.msg);
						}
					});
				}
				return false;
			});
			$(this.table).on('click', '.js-delete', function(e) {
				var ajaxurl = $(this).attr('href');
				var param = $(this).attr('js-ajax-param') || {};
				$.confirm('是否确认删除？', [{
					yes: "确定"
				}, {
					no: '取消'
				}], function(t) {
					var d = this;
					if (t == "yes") {
						var objAux = {
							url: ajaxurl,
							type: 'POST',
							data: param,
							async: false,
							dataType: 'json'
						}
						$.when($.ajax(objAux)).done(function() {
							$(e.target).closest('tr').remove()
							d.hide();
							setTimeout(function() {
								_this.gosearch()
							}, 500)
						}).fail(function() {
							//todo fail logic
						});
					} else {
						d.hide();
					}
				});
				return false;
			})
		},
		bindSearch: function() {
			var _this = this;
			this.search.click(function() {
				_this.gosearch();
			});
		},
		gosearch: function() {
			var _this = this;
			_this.currentPage = 1;
			if (_this.search) {
				_this.param = $.extend(_this.param, _this.getParam(_this.search.closest('.form')));
			}
			_this.param = $.extend(_this.param, _this.getParam($(_this.filterCon)));
			_this.bind();
		},
		getParam: function(form) {
			return Query.getForm(form);
		},
		bind: function() {
			var _this = this;
			//this.param = $.extend(this.param, {
			//  nPageNo: this.currentPage,
			//  nPageSize: this.pageSize
			//});
			this.param = $.extend(this.param, {
				//'begin': (this.currentPage - 1) * this.pageSize + 1,
				//'end': this.currentPage * this.pageSize + 1,
				'page': this.currentPage,
				'page_size': this.pageSize
			});
			_this.table.css('position', "relative");
			if (_this.table.find('.loadingdata').size() == 0) {
				var t = (_this.table.height() / 2 - 32);
				t = t < 0 ? 32 : t;
				t = 30;
				var l = _this.table.width() / 2 - 32;
				_this.table.find('tbody,.tbody').html('');
				//_this.table.nextAll('.sg-pager').find('.nodata').html('');
				_this.page.hide();
				_this.table.append('<div class="loadingdata" style="position:absolute;left:' + l + 'px;top:' + t + 'px;"/>');
			};

			_this.ajaxData(_this.ajaxurl, _this.param).done(function(result) {
				_this.page.show();
				//loading.remove();
				_this.loading && _this.loading.remove();
				$('.loadingdata').remove();
				if (!result.hasError) {
					var data = result.data;
					var html = _this.template(data);
					_this.table.html(html);
					if (result.data) {
						_this._total = result.data.count.total || 0;
					}
					_this.initPager();
					// _this.event();
					_this.callback ? _this.callback(_this, _this.table) : null;
				} else {}
			});
		},
		initPager: function() {
			var _this = this;
			var tar = _this.page;
			//tar.html('');
			if (tar.data("pagesize")) {
				_this.pageSize = tar.data("pagesize");
			} else {
				tar.data("pagesize", _this.pageSize);
			}
			tar.attr("pagesize", _this.pageSize);

			//tar.parent().prevAll().remove();
			if (_this._total == 0) {
				_this.table.html('<p class="pdl10 nodata">' + '没有符合条件的数据!' + '</p>');
				tar.hide();
			} else {
				tar.show();
			}
			this.pageData = null;
			this.page.html('');
			this.pageData = new Paging();
			this.pageData.init({
				target: this.page,
				pagesize: _this.pageSize,
				current: _this.currentPage,
				count: _this._total,
				callback: function(p) {
					_this.currentPage = p;
					_this.bind();
				}
			});
		},
		ajaxData: function(url, param) {
			param = $.extend({}, param);
			//return $.post(url, param, function(data) {}, 'json');
			var xhr = $.ajax({
				type: this.settings.type,
				url: url,
				data: param,
				dataType: 'json'
			});
			return xhr;
		}
	};
	return Table;
});