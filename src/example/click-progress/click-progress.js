= false;
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
			$(obj).on('mousedown', trigger, click);

			function click(e) {
				return fn.call(this, e);
			}
		},
		bindEvent: function() {
			var _this = this;
			this.touch(this.trigger, function() {
				_this.v = _this.dv;
				_this.setup();
				_this.settings.clicked && _this.settings.clicked(_this.trigger, _this.target, _this.power);
				return false;
			});
		},
		setup: function() {
			var _this = this;
			if (this.timer) {
				//clearInterval(this.timer);
				return;
			}
			this.timer = setInterval(function() {
				_this.animate();
			}, this.time);
		},
		animate:function(){
			var _this =this;
			_this.power = _this.finish[_this.change]();
			_this.power += _this.v;
			_this.power = Math.max(0, _this.power);
			_this.power = Math.min(_this.power, _this.full);
			_this.finish[_this.change](_this.power);
			if (_this.power == _this.full) {
				//clearInterval(_this.timer);
				_this.settings.callback && _this.settings.callback.call(this,_this.trigger, _this.target, _this.power);
			}
			_this.settings.progress && _this.settings.progress(_this.trigger, _this.target, _this.power);
			_this.a =_this.da + (1 *_this.power/ _this.full) ;
			_this.v -= _this.a;
			if (_this.power <= 0) {
				clearInterval(_this.timer);
				_this.timer = null;
			}
		}
	}
	return ClickProgress;
});