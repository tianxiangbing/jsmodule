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
	Handlebars.registerHelper('indexOf', function(v1, arr, options) {
		var returnValue = false;
		for (var i = 0, l = arr.length; i < l; i++) {
			if (arr[i] == v1) {
				returnValue = true;
			}
		}
		if (returnValue) {
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
	Handlebars.registerHelper('addOne', function(v1) {
		return parseInt(v1) + 1 || 0 + 1;
	});

	function Table(table, temp, page, param, search, callback) {
		this.search = search;
		this.table = table;
		this.page = page;
		//this.filterCon = filterCon;
		this.temp = temp;
		this.template = null;
		this.pageData = null;
		this.ajaxurl = table.attr('ajaxurl');
		this.ajaxDeleteItemUrl = table.attr('data-ajax-deleteitem-url')
		this._total = 0;
		this.pageSize = page.attr('pagesize') || 10;
		this.callback = callback;
		this.param = $.extend(param, {});
	}
	Table.prototype = {
		init: function(settings) {
			var source = this.temp.html();
			this.template = Handlebars.compile(source);
			this.settings = $.extend({
				type: 'post',
				hash: true
			}, settings);
			this.currentPage = this.settings.hash ? parseInt((Query.getQuery('page', "#")) || 1) : 1;
			if (this.search) {
				this.param = $.extend(this.param, this.getParam(this.search.closest('.form')));
				this.bindSearch();
			}
			if (this.settings.hash) {
				this.bindHash();
				//this.gosearch(this.currentPage);
			}
			this.bind();
			var _this = this;
			//setTimeout(function() {
				_this.event();
			//}, 100)
		},
		event: function() {
			var _this = this;
			$(this.table).bind('reload', function() {
				//_this.gosearch();
				_this.bind();
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
					if ($(this).attr('confirm-msg')) {
						$.confirm($(this).attr('confirm-msg'), [{
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
									dataType: 'json'
								}
								$.ajax(objAux).done(function(result) {
									if (result.status) {
										d.hide();
										//_this.gosearch(_this.currentPage);
										_this.bind();
									} else {
										$.alert(result.msg);
									}
								});
							} else {
								d.hide();
							}
						});
					} else {
						var objAux = {
							url: ajaxurl,
							type: 'POST',
							data: param,
							dataType: 'json'
						}
						$.ajax(objAux).done(function(result) {
							if (result.status) {
								//_this.gosearch(_this.currentPage);
								_this.bind();
							} else {
								$.alert(result.msg);
							}
						});
					}
				}
				return false;
			});
			$(this.table).on('click', '.js-delegate-delete', function(e) {
				var ajaxurl = $(this).attr('href');
				var param = $(this).attr('js-ajax-param') || {};
				var link = $(this);
				$.confirm('是否确认删除该记录？', [{
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
							dataType: 'json'
						}
						$.ajax(objAux).done(function(result) {
							if (result.status) {
								d.hide();
								setTimeout(function() {
									if (link.closest('tr').siblings('tr').size() == 0 && _this.currentPage > 1) {
										_this.currentPage--;
										_this.gosearch(_this.currentPage)
									} else {
										_this.gosearch(_this.currentPage);
										_this.bind();
									}
									$(e.target).closest('tr').remove();
								}, 500)
							} else {
								$.alert(result.msg);
							}
						});
					} else {
						d.hide();
					}
				});
				return false;
			});
			this.table.delegate("a:not(.js-ajax,.js-delegate-delete)", "click", function(e) {
				var link = $(this).attr('href');
				if (link != '' && link != 'javascript:void(0)' && link != 'javascript:;' && typeof link != 'undefined') {
					link += location.hash;
					location.href = link;
					e.preventDefault();
				}
			});
			if (_this.settings.hash == true) {
				$(window).on('hashchange', function() {
					_this.bindHash();
					_this.bind();
				});
			}
		},
		bindSearch: function() {
			var _this = this;
			this.search.click(function() {
				_this.gosearch();
				return false;
			});
		},
		//锚点改变时绑定表单值
		bindHash: function() {
			var hash = Query.getHash();
			this.param = $.extend(this.param, hash);
			this.currentPage = parseInt(Query.getHash('page') || 1);
			this.page_size = Query.getHash('page_size');
			$('[name]', this.search.closest('.form')).each(function() {
				$(this).val(hash[$(this).attr('name')]).trigger('userChange'); //这里赋值后调用了user change事件,方面隐藏域的回调
			});
		},
		gosearch: function(p) {
			var _this = this;
			_this.currentPage = p || 1;
			if (_this.search) {
				var searchParam = _this.getParam(_this.search.closest('.form'));
				_this.param = $.extend(_this.param, searchParam);
			}
			if (this.settings.hash) {
				Query.setHash($.extend(_this.param, {
					'page': this.currentPage
				}));
			} else {
				_this.bind();
			}
		},
		getParam: function(form) {
			var searchParam = Query.getForm(form);
			return searchParam;
		},
		bind: function() {
			var _this = this;
			//this.param = $.extend(this.param, {
			//  nPageNo: this.currentPage,
			//  nPageSize: this.pageSize
			//});
			/*
			if (_this.search) {
				var searchParam = _this.getParam(_this.search.closest('.form'));
				_this.param = $.extend(_this.param, searchParam);
			}
			*/
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
				_this.table.nextAll('.sg-pager').find('.nodata').html('');
				_this.page.hide();
				_this.table.append('<div class="loadingdata" style="position:absolute;left:' + l + 'px;top:' + t + 'px;"/>');
			};
			_this.ajaxData(_this.ajaxurl, _this.param).done(function(result) {
				_this.page.show();
				//loading.remove();
				_this.loading && _this.loading.remove();
				$('.loadingdata').remove();
				if (result.status) {
					var data = result.data;
					var html = _this.template(data);
					_this.table.html(html);
					if (result.data) {
						_this._total = result.data.count.total || 0;
					}
					_this.initPager();
					// _this.event();
					_this.callback ? _this.callback.call(_this, result.data, _this.table) : null;
				} else {
					$.alert(result.msg);
					_this.table.html(result.msg);
				}
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

			tar.parent().prevAll().remove();
			if (_this._total == 0) {
				_this.table.html('<p class="pdl10 nodata">' + '没有符合条件的数据!' + '</p>');
				tar.hide();
			} else {
				tar.show();
			}
			if (!this.pageData) {
				this.pageData = new Paging();
				this.pageData.init({
					target: this.page,
					pagesize: _this.pageSize,
					count: _this._total,
					hash: _this.settings.hash,
					callback: function(p) {
						_this.currentPage = p;
						if (!_this.settings.hash) {
							_this.bind();
						}
					},
					current: this.currentPage
				});
			} else {
				this.pageData.render({
					count: _this._total,
					pagesize: _this.pageSize,
					current: this.currentPage
				});
			}
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