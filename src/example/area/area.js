(function(root, factory) {
	//amd
	if (typeof define === 'function' && define.amd) {
		define(['$', 'area-data'], factory);
	} else if (typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.Area = factory(window.Zepto || window.jQuery || $, AreaData);
	}
})(this, function($, AreaData) {
	return {
		init: function(areaurl) {
			setTimeout(function() {
				var result = AreaData;
				$('.area-input').each(function() {
					var province = $(".province .area-content", this);
					var city = $(".city .area-content ul", this);
					var downtown = $(".downtown .area-content ul", this);
					var _this = this;
					var provinceData = [result.data];
					var html = $("<div/>");
					setTimeout(function() {
						for (var i = 0, l = provinceData.length; i < l; i++) {
							var row = $("<ul/>");
							var item = provinceData[i];
							(function(i) {
								setTimeout(function() {
									for (var j = 0, len = item.length; j < len; j++) {
										var p = $('<li data-value="' + provinceData[i][j].id + '">' + provinceData[i][j].name + '</li>');
										row.append(p);
										var citylist = provinceData[i][j].child || [];
										p.data("child", citylist);
										p.click(function(e, args) {
											city.children().hide();
											var area = city.closest('.area');
											$(area.children('span')).html('-- 城市 --');
											var area2 = downtown.closest('.area');
											$(area2.children('span')).html('-- 市区 --');
											if (typeof args == "undefined") {
												$(area.children('input')).val('');
												$(area2.children('input')).val('');
											}

											downtown.children().hide();
											city.html('');
											$.each($(this).data('child') || [], function() {
												var c = $('<li data-value="' + this.id + '" >' + this.name + '</li>');
												city.append(c);
												c.data('child', this.child);
												c.click(function(e, args) {
													var area2 = downtown.closest('.area');
													if (typeof args == "undefined") {
														$(area2.children('input')).val('');
													}
													$(area2.children('span')).html('-- 市区 --');
													downtown.children().remove();
													$.each($(this).data('child') || [], function() {
														var d = $('<li data-value="' + this.id + '" >' + this.name + '</li>');
														downtown.append(d);
														var input = $('#hd_downtown', _this);
														if (input.val() == this.id) {
															var namec = this.name;
															var cid = this.id;
															(function(input, c, cid) {
																setTimeout(function() {
																	input.next().html(namec);
																	input.val(cid);
																}, 0);
															})(input, c, cid);
														}
													});
													return args;
												});
												var input = $('#hd_city', _this);
												if (input.val() == this.id) {
													var namec = this.name;
													var cid = this.id;
													(function(input, c, cid) {
														setTimeout(function() {
															input.next().html(namec);
															input.val(cid);
															c.trigger('click', false);
														}, 100);
													})(input, c, cid);
												}
											});

											return args;
										});
										var input = $('#hd_province', _this);
										if (input.val() == provinceData[i][j].id) {
											input.next().html(provinceData[i][j].name);
											(function(p) {
												setTimeout(function() {
													p.trigger('click', false);
												}, 100);
											})(p);
										}
										/*
										(function(p, citylist) {
											setTimeout(function() {
												for (var k = 0, cl = citylist.length; k < cl; k++) {
													if (!citylist[k]) continue;
													var c = $('<li data-value="' + citylist[k].id + '" >' + citylist[k].name + '</li>');
													var arr = p.data("child", p.data("child") || []);
													arr.push(c);
													p.data("child", arr);
													p.data("child");
													c.hide();
													city.append(c);
													c.click(function(e, args) {
														var area2 = downtown.closest('.area');
														$(area2.children('input')).val('');
														$(area2.children('span')).html('-- 市区 --');
														downtown.children().hide();
														($(this).data('child') || $([])).each(function() {
															$(this).show();
														});
														return args;
													});
													var input = $('#hd_city', _this);
													if (input.val() == citylist[k].id) {
														var namec = citylist[k].name;
														var cid = citylist[k].id;
														(function(input, c, cid) {
															setTimeout(function() {
																input.next().html(namec);
																input.val(cid);
																c.trigger('click', false);
															}, 100);
														})(input, c, cid);
													}
													var downtownlist = citylist[k].child || [];
													for (var t = 0, ct = downtownlist.length; t < ct; t++) {
														if (!downtownlist[t]) continue;
														var d = $('<li data-value="' + downtownlist[t].id + '">' + downtownlist[t].name + '</li>');
														var arr = c.data("child", c.data("child") || []);
														arr.push(d);
														c.data("child", arr);
														c.data("child");
														d.hide();
														downtown.append(d);
														var inputdt = $('#hd_downtown', _this);
														if (inputdt.val() == downtownlist[t].id) {
															var name = downtownlist[t].name;
															var cid = downtownlist[t].id;
															(function(inputdt, cid) {
																setTimeout(function() {
																	inputdt.val(cid);
																	inputdt.next().html(name);
																}, 40);
															})(inputdt, cid);
														}
													}
												}
											})
										})(p, citylist);
										 */
									}
									html.append(row);
								}, 0);
							})(i);
						}
						province.html(html);
					}, 0);
				});
			}, 0);
			$('.area-input .area').off('click');
			$('.area-input .area').click(function() {
				$('.area-input .area').removeClass('active');
				$('.area-content').not($(this).find('.area-content')).hide();
				$(this).find('.area-content').toggle();
				var arearow = $(this).closest('.area-row');
				if ($(this).find('.area-content:visible').size()) {
					$(this).addClass('active');
					arearow.css('zIndex', 44);
				} else {
					$(this).removeClass('active');
					arearow.css('zIndex', 22);
				}
				return false;
			});
			$('.area-input .area-content').off('click', 'ul');
			$('.area-input .area-content').on('click', 'ul', function() {
				return false;
			});
			$('.area-input .area-content').off('click', 'li');
			$('.area-input .area-content').on('click', 'li', function() {
				var area = $(this).closest('.area');
				area.find('input').val($(this).data('value'));
				area.children('span').html($(this).html());
				area.trigger('click');
				return false;
			});
			$('body').click(function() {
				$('.area-content').hide();
				$('.area-input .area').removeClass('active');
				$('.area-row').css('zIndex', 22);
			});
		}
	};
});