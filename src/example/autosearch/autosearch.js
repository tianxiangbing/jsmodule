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