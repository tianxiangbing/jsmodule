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
		define([], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.LocalStorageCache = factory();
	}
})(this, function() {
	var LocalStorageCache = {
		//expired:0时浏览器关闭过期，默认不过期，int时是以秒为单位，date类型到期日期
		add: function(key, value, expired) {
			if (typeof vallue == "object") {
				value = JSON.stringify(value);
			}
			expired = this._getExp(expired);
			var obj = {
				data: value,
				expired: expired,
				time: +new Date()
			};
			localStorage.setItem(key, JSON.stringify(obj));
		},
		get: function(key, promise) {
			var obj = JSON.parse(localStorage.getItem(key));
			var dtd = $.Deferred();
			var _this = this;
			if (obj == null) {
				if (promise) {
					promise().fail(function() {
						dtd.reject(null);
					}).done(function(data) {
						_this.add(key, data);
						dtd.resolve(data);
					});
				} else {
					dtd.reject(null);
				}
			} else
			if (obj.expired > 0) {
				var now = +new Date();
				if (now > obj.expired) {
					//过期
					if (promise) {
						promise().fail(function() {
							dtd.reject(obj.data);
						}).done(function(data) {
							_this.update(key, data);
							dtd.resolve(data);
						});
					} else {
						dtd.reject(null);
					}
				} else {
					dtd.resolve(obj.data);
				}
			} else {
				dtd.resolve(obj.data);
			}
			return dtd.promise();
		},
		remove: function(key) {
			localStorage.removeItem(key);
		},
		clear: function() {
			localStorage.clear();
		},
		update: function(key, value, expired) {
			if (typeof vallue == "object") {
				value = JSON.stringify(value);
			}
			expired = this._getExp(expired);
			var json = JSON.parse(localStorage.getItem(key));
			if (json != null) {
				(typeof expired == 'undefined' || expired == '') ? expired = json.expired: null;
			}
			var obj = {
				data: value,
				expired: expired,
				time: +new Date()
			};
			localStorage.setItem(key, JSON.stringify(obj));
		},
		setExpired: function(key, expired) {
			expired = this._getExp(expired);
			var obj = JSON.parse(localStorage.getItem(key));
			obj.expired = expired;
			localStorage.setItem(key, JSON.stringify(obj));
		},
		_getExp: function(expired) {
			if (expired == 0) {
				var _this = this;
				window.onbeforeunload = function() {
					_this.remove(key);
				}
			} else if (typeof expired == 'number' || !isNaN(Number(expired))) {
				var now = +new Date();
				expired = now + expired * 1000;
			} else if (typeof expired == "object") {
				expired = expired.getTime() || -1;
			}
			return expired;
		}
	};
	return LocalStorageCache;
});