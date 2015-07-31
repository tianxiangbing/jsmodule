nction() {
							if (this.readystate == "complete" || this.readyState == "loaded") {
								setObj.call(this, i);
							}
						}
						img.onload = function() {
							setObj.call(this, i);
						}
					}
				})(img, i);
			});

			function setObj(i) {
				var h = this.height;
				var w = this.width;
				var c = _this.container;
				//console.log(h,w)
				//if(i==4)debugger;
				//未设置高度时，以第一个加完的图片的高度为准，其他图片都等比自缩放，小于容器时，原样显示
				if (!_this.settings.height) {
					var ch = (_this.container.width() / w) * h;
					//_this.settings.height = (_this.container.width() / w) * h;
					_this.container.height((_this.container.width() / w) * h);
					_this.container.find('a').height(ch);
					_this.content.css({
						position: "absolute"
					});
				}
				//set img width height
				var imgw = _this.container.width();
				var imgh = imgw / w * h;
				if ($('.carousel-' + i, c).height() > _this.container.height()) {
					$('.carousel-' + i, c).height(_this.container.height());
					$('.carousel-' + i, c).width(_this.container.height() / h * w);
				}
				if ($('.carousel-' + i, c).width() > _this.container.width()) {
					$('.carousel-' + i, c).width(imgw);
					$('.carousel-' + i, c).height(imgh);
				}
				//setposition
				var iw = $('.carousel-' + i, c).width();
				var ih = $('.carousel-' + i, c).height();
				var top = (_this.container.height() - ih) / 2;
				var left = (_this.container.width() - iw) / 2;
				$('.carousel-' + i, c).css({
					left: left,
					top: top,
					position: "absolute"
				});
			}
		},
		touch: function(obj, trigger, fn) {
			var move;
			var istouch = false;
			if (typeof trigger === "function") {
				fn = trigger;
			};
			$(obj).on('touchmove', trigger, function(e) {
				move = true;
			}).on('touchend', trigger, function(e) {
				e.preventDefault();
				if (!move) {
					var returnvalue = fn.call(this, e, 'touch');
					if (returnvalue === false) {
						e.preventDefault();
						e.stopPropagation();
					}
				}
				move = false;
			});
			$(obj).on('click', trigger, click);

			function click(e) {
				return fn.call(this, e);
			}
		},
		bindEvent: function() {
			var _this = this;
			var start = {},
				istartleft = 0,
				end = {},
				move = false;
			var curPos = {};
			this.content.on('touchstart', function(e) {
				start = {
					x: e.changedTouches[0].pageX
				};
				if (e.targetTouches.length == 2) {
					move = false;
					return false;
				};
				curPos = $(this).position();
				istartleft = start.x;
				_this.stop();
			}).on('touchmove', function(e) {
				if (e.targetTouches.length == 2) {
					return false;
				}
				move = true;
				end = {
					x: e.changedTouches[0].pageX
				};
				// var curPos = $(this).position();
				if (!_this.bloom) {
					//只移动x轴
					curPos.left = curPos.left + (end.x - start.x);
					$(this).css({
						left: curPos.left
					});
				} else {
					curPos = {
						left: curPos.left + (end.x - start.x)
					}
					$(this).css(curPos);
				}
				start = end;
				return false;
			}).on('touchend', function(e) {
				end = {
					x: e.changedTouches[0].pageX
				};
				var curPos = $(this).position();
				var stopPos = {
					left: curPos.left + (end.x - start.x)
				};
				$(this).css(stopPos);
				if (end.x > istartleft+10) {
					_this.index--;
					_this.go();
				} else if (end.x < istartleft-10) {
					_this.index++;
					_this.go();
				}
				move = false;
				_this.auto();
				//return false;
			});
			_this.touch(_this.num, "i", function() {
				clearInterval(_this.interval);
				_this.index = $(this).index();
				_this.go();
				_this.auto();
			});
			$(window).resize(function() {
				if (!_this.settings.width) {
					_this.content.find('img').css({
						width: "auto",
						height: "auto"
					});
					_this.go();
					_this.setHeightWidth();
				}
			});
		},
		formatNum: function() {
			if (this.num) {
				var html = '';
				for (var i = 0, l = this.list.length; i < l; i++) {
					var item = this.list[i];
					var cls = '';
					if (this.index == i) {
						cls = 'current';
					}
					html += '<i class="' + cls + '">' + (i + 1) + '</i>';
				};
				this.num.html(html);
			}
		},
		go: function() {
			var _this = this;
			var step = _this.step;
			if (this.repeat) {
				var left = -(_this.index + 1) * step;
				if (_this.index < 0) {
					left = 0
				}
				if (_this.index == 0) {
					left = -step;
				}
				_this.content.animate({
					left: left
				}, _this.animate, function() {
					if (_this.index < 0) {
						_this.index = _this.list.size() - 1;
						_this.content.css("left", -(_this.index + 1) * step);
					}
					if (_this.index >= _this.list.size()) {
						_this.index = 0;
						_this.content.css("left", -1 * step);
					}
					_this.formatNum();
				});
			} else {
				if (_this.index < 0) {
					_this.index = 0
				}
				if (_this.index >= _this.size) {
					_this.index = _this.size - 1;
				}
				var left = -_this.index * step;
				_this.content.animate({
					left: left
				}, _this.animate, function() {
					_this.formatNum();
				});
			}
		},
		auto: function() {
			var _this = this;
			if (this.interval) {
				_this.stop();
			}
			this.interval = setInterval(function() {
				_this.index++;
				if (!_this.repeat) {
					if (_this.index >= _this.size) {
						_this.index = 0;
					}
				}
				_this.go();
			}, this.timer);
		},
		stop: function() {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
	return CarouselImage;
});