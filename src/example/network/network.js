/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/format-number
 * User: 田想兵
 * Date: 2015-08-05
 * Time: 11:27:55
 * Contact: 55342775@qq.com
 */
;
(function(root, factory) {
	//cmd
	if (typeof define === 'function' && define.cmd){
		define(function(require, exports, module) {
			var $ = require("$");
			return factory($);
		});
	}else if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Network = factory(window.Zepto || window.jQuery || $);
	}
})(this, function($) {
	var Network = {
		loadingTpl: '<div class="ui-ajax-loading"><div class="ui-ajax-mask"></div><i></i></div>',
		get: function(url, data, fun, dataType) {
			if (typeof data === "function") {
				fun = data;
				data = {};
				dataType = fun || 'json';
			}
			dataType = dataType || 'json';
			var settings = {
				url: url,
				data: data,
				type: 'get',
				success: fun,
				dataType: dataType
			};
			return this.ajax(settings);
		},
		post: function(url, data, fun, dataType) {
			if (typeof data === "function") {
				fun = data;
				data = {};
				dataType = fun || 'json';
			}
			dataType = dataType || 'json';
			var settings = {
				url: url,
				data: data,
				type: 'post',
				success: fun,
				dataType: dataType
			};
			return this.ajax(settings);
		},
		ajaxList: {},
		_key: 1,
		ajax: function(settings, target) {
			var _this = this;
			var deferred = $.Deferred();
			if (target) {
				if ($(target).hasClass('ui-ajaxing')) {
					return deferred.promise();
				}
				$(target).addClass('ui-ajaxing');
				//add loading...
			}
			var obj = {
				url: settings.url,
				data: settings.data
			};
			settings.dataType = settings.dataType||"json";
			if (_this._hasRequest(obj.url, obj.data)) {
				return deferred.promise();
			}
			_this._loading(target);
			_this.ajaxList[_this._key] = obj;
			_this._key++;
			return $.ajax(settings).always(function(result) {
				//当返回失败或无一次限制时移除这些
				if(!settings.oneRequest || !settings.oneRequest(result) ){
					$(target).removeClass('ui-ajaxing');
					delete _this.ajaxList[_this._hasRequest(settings.url, settings.data)];
				}
				_this._removeLoading(target);
			}).fail(function(e){
				alert('系统出错！可能您需要刷新后再试！');
			});
		},
		_hasRequest: function(url, data) {
			var _this = this;
			data = _this._convertObject(data);
			//console.log(data,_this.ajaxList)
			for (var j in _this.ajaxList) {
				var item = _this.ajaxList[j];
				if (item.url == url && _this._convertObject(item.data) == data) {
					return j;
				}
			}
			return false;
		},
		_convertObject: function(data) {
			if (data && typeof data == "object") {
				var a = [];
				for (var i in data) {
					a.push(i + "=" + data[i]);
				}
				data = a.join('&');
			}
			return data;
		},
		_removeLoading: function(target) {
			var content = $(target || "html");
			var loading = $(content).data('loading');
			var index = loading.data('index')||0;
			index --;
			if(index<=0){
				loading.remove();
			}
			loading.data('index',index);
		},
		_loading: function(target) {
			var _this = this;
			var content = $(target || "html");
			var loading = $(content).data('loading');
			if (!loading) {
				loading = $(_this.loadingTpl);
				$('body').append(loading);
				var index = loading.data('index')||0;
				loading.data('index',index+1)
				$(content).data('loading', loading);
			}
			var ch = $(content).outerHeight();
			var cw = $(content).outerWidth();
			if (!target) {
				ch = Math.max($('html').height(), $(window).height());
				cw = Math.max($('html').width(), $(window).width());
			}
			console.log(cw,ch)
			loading.height(ch).width(cw);
			loading.find('div').height(ch).width(cw);
			if (ch < 100) {
				loading.find('i').height(ch).width(ch);
			}
			var offset = $(content).offset();
			loading.css({
				top: offset.top,
				left: offset.left
			});
			var icon = loading.find('i');
			var h = ch,
				w = cw,
				top = 0,
				left = 0;
			if(!target){
				h = $(window).height();
				w = $(window).width();
				top = (h - icon.height()) / 2 + $(window).scrollTop();
				left = (w - icon.width()) / 2 + $(window).scrollLeft();
			} else {
				top = (h - icon.height()) / 2;
				left = (w - icon.width()) / 2;
			}
			icon.css({
				top: top,
				left: left
			})
		}
	}
	return Network;
});