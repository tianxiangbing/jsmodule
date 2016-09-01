/*
 * Created with Sublime Text 2.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * User: 田想兵
 * Date: 2015-03-16
 * Time: 20:27:54
 * Contact: 55342775@qq.com
 */
"use strict";;
(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Audio = factory(window.Zepto || window.jQuery || $);
	}
})(window, function($) {
	$.fn.Audio = function(settings) {
		var list = [];
		$(this).each(function() {
			var audio = new Audio();
			var options = $.extend({
				target: $(this)
			}, settings);
			audio.init(options);
			list.push(audio);
		});
		return list;
	};
	class Audio {
		contructor() {}
		init(options) {
			let rnd = Math.random().toString().replace('.', '');
			this.id = 'audio_' + rnd;
			this.settings = {};
			this.controller = null;
			var _this = this;
			this.settings = $.extend(this.settings, options);
			this.audio = $(this.settings.target).get(0);
			this.createDom();
			_this.duration = _this.audio.duration;
			if (_this.duration != "Infinity") {
				_this.durationContent.html(Math.floor(_this.duration) + 's');
			} else {
				_this.durationContent.html($(_this.settings.target).attr('duration')||"");
			}
			this.settings.target.on('canplaythrough', function() {
				_this.duration = _this.audio.duration;
				if (_this.duration != "Infinity") {
					_this.durationContent.html(Math.floor(_this.duration) + 's');
				} else {
					var attr = $(_this.settings.target).attr('duration');
					if(attr){
						_this.durationContent.html($(_this.settings.target).attr('duration')+"s");
					}else{
						_this.durationContent.html('');
					}
				}
			});
			this.bindEvent();
		}
		createDom() {
			var html = '<div id="' + this.id + '" class="ui-audio"><i></i></div>';
			this.settings.target.hide().after(html);
			this.controller = $('#' + this.id);
			this.durationContent = $('<div class="ui-duration"></div>');
			this.controller.append(this.durationContent);
		}
		bindEvent() {
			var _this = this;
			this.controller.on('click', function() {
				_this.play();
			});
			$(this.audio).on('ended', () => _this.stop());
			$(this.audio).on('timeupdate', () => this.settings.updateCallback && this.settings.updateCallback.call(this, this.audio, this.audio.duration, this.durationContent))
			$(this.audio).on('error',()=>{
				alert('加载音频文件出现错误!')
			});
		}
		play() {
			if (this.audio.paused) {
				this.audio.play();
				this.controller.addClass('play');
			} else {
				this.audio.pause();
				this.controller.removeClass('play');
			}
			this.settings.playCallback && this.settings.playCallback.call(this, this.audio, this.audio.paused, this.durationContent);
		}
		stop() {
			this.controller.removeClass('play');
			this.settings.stopCallback && this.settings.stopCallback.call(this, this.audio, this.audio.paused, this.durationContent);
		}
	}
	return Audio
});