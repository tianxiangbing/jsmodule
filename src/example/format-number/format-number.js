/*
 * Created with Sublime Text 3.
 * license: http://www.lovewebgames.com/jsmodule/index.html
 * github: https://github.com/tianxiangbing/format-number
 * User: 田想兵
 * Date: 2015-08-01
 * Time: 11:27:55
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
        root.FormatNumber = factory(window.Zepto || window.jQuery || $);
    }
})(this, function($) {
    $.fn.FormatNumber = function(settings) {
        var arr = [];
        $(this).each(function() {
            var options = $.extend({
                trigger: $(this)
            }, settings);
            var number = new FormatNumber();
            number.init(options);
            arr.push(number);
        });
        return arr;
    };
    var FormatNumber = function() {};
    FormatNumber.prototype = {
        init: function(settings) {
            var _this = this,
                minus = ''
            settings = $.extend({
                trigger: '[data-type="money"]',
                decimal: 2,
                minus: false, //是否支持负数,默认不支持
                parent: 'body'
            }, settings);
            this.settings = settings;
            var excludeKey = {
                "left": 37,
                "right": 39,
                "top": 38,
                "down": 40,
                "home": 36,
                "end": 35,
                "shift": 16
            };
            var regex = '([1-9]\\d*(\\.\\d{1,2})?|0(\\.\\d{1,2})?)';
            if (settings.decimal <= 0 && settings.minus == true) {
                regex = '(^-?[1-9]\\d*$)|(^[0]$)'; //正负整数
            } else if (settings.decimal == 0) {
                regex = '(^[1-9]\\d*$)|(^[0]$)'; //正整数
            } else if (settings.minus == true) {
                //regex = '^-?([1-9]\\d*(\\.\\d{1,' + settings.decimal + '})?|([^0]{1}(\\.\\d{1,' + settings.decimal + '}))?)';
                regex = '(^-)?((([1-9]d*(\\.\\d{1,' + settings.decimal + '})?)|((^[0]{1}\\.(\\d{1,' + settings.decimal + '})?$))|^[0]$))'
            } else {
                regex = '([1-9]\\d*(\\.\\d{1,' + settings.decimal + '})?|([^0]{1}(\\.\\d{1,' + settings.decimal + '}))?)';
            }
            parent = parent || 'body';
            $(settings.trigger, parent).each(function(i, v) {
                var txt, formatTxt;
                if ($(v)[0].tagName == 'INPUT') {
                    txt = $(v).val();
                    if ($(v).attr('data-name')) {
                        var name = $(v).attr('data-name'),
                            id = name.split('.')[1] || name.split('.')[0];
                        $(v).parent().append('<input data-rule="number" id="' + id + '" type="hidden" name="' + name + '" />');
                        $('#' + id).val(_this.getMoneyfloat($(v).val()));
                    }
                    formatTxt = _this.doFormat(txt);
                    $(v).val(formatTxt);
                } else {
                    txt = $(v).text();
                    formatTxt = _this.doFormat(txt);
                    $(v).attr('data-value', txt).text(formatTxt);
                }
                $(this).attr('data-value', $(v).val());
            });

            $(settings.trigger, parent).on('keyup', function(e) {
                checkNumber.call(this, e)
            });
            $(settings.trigger, parent).on('blur', function(e) {
                checkNumber.call(this, e)
            });

            function checkNumber(e) {
                var name = $(this).attr('data-name'),
                    id = name.split('.')[1] || name.split('.')[0];
                GetNumberResult(e, $(this)[0], regex);
                var v = _this.getMoneyfloat($(this).val());
                $('#' + id).val(v);
                $(this).attr('data-value', v);
            }

            function GetNumberResult(e, obj, reg) {
                var valueLength = obj.value.length;
                var position = getTxtCursorPosition(obj);
                var key = window.event ? e.keyCode : e.which;
                var result = convertNumberN(key, obj.value, reg);
                obj.value = result
                position += (result.length - valueLength);
                setTxtCursorPosition(obj, position);
            }

            /**
             *   说明: 检查不做处理的键盘Key
             *   参数: 键盘KeyCode {string}
             * 返回值: 如果是不做处理的key返回true，反之false {bool}
             */
            function checkInactionKey(keyCode) {

                for (var key in excludeKey) {
                    if (keyCode == excludeKey[key]) {
                        return true;
                    }
                }
                return false;
            }

            /**
             *   说明: 获取文本框的光标位置
             *   参数: 文本框对象 {dom object}
             * 返回值: {int}
             */
            function getTxtCursorPosition(txtObj) {

                var tempObj = txtObj;
                var cursurPosition = -1;

                if (tempObj.selectionStart != undefined) { //非IE浏览器
                    cursurPosition = tempObj.selectionStart;
                } else { //IE
                    var range = document.selection.createRange();
                    range.moveStart("character", -tempObj.value.length);
                    cursurPosition = range.text.length;
                }

                return cursurPosition;
            }

            /**
             *   说明: 转换数字为千分位，常用于财务系统
             *   参数: 键盘key {string}，被处理的字符串 {string}
             * 返回值: 返回转换的结果 {string}
             */
            function convertNumberN(key, value, reg) {

                if (checkInactionKey(key)) {
                    return value;
                }

                var tempValue = value;
                var isminus = false;
                var replaceReg = /[^\d\.]/g;
                if (settings.minus && /^\-/.test(tempValue)) {
                    tempValue = tempValue.slice(1);
                    isminus = true;
                }
                if (tempValue.indexOf(".") <= 0) {
                    //replaceReg = /[^\d]/g;
                    tempValue = tempValue.replace(replaceReg, "");
                } else {
                    tempValue = tempValue.replace(replaceReg, "");
                    var isNaNNum = parseFloat(tempValue + "00");
                    if (isNaN(isNaNNum)) {
                        tempValue = isNaNNum;
                    }
                    if (/\./.test(tempValue) && settings.decimal == 0) {
                        tempValue = tempValue.toString().replace(/\./g, '');
                    }
                }
                var re = new RegExp(reg);
                if (!re.exec(tempValue) && tempValue != "") {
                    tempValue = "0";
                }

                var tempValueArray = tempValue.split(".");
                tempValue = tempValueArray.length > 1 ?
                    (tempValueArray[0].length > 14 ? tempValueArray[0].substr(0, 14) : tempValueArray[0]) + "." + tempValueArray[1] :
                    (tempValue.length > 14 ? tempValue.substr(0, 14) : tempValue);

                var result = _this.doFormat(tempValue);
                if (isminus) result = '-' + result;
                if (result == null) {
                    return;
                }

                var resultArray = result.split(".");

                if (tempValue.lastIndexOf(".") >= 0) {
                    if (tempValue.lastIndexOf(".") == tempValue.length - 1) {
                        tempValue = resultArray[0] + '.';
                    } else {
                        var subLength = tempValue.length - (tempValue.lastIndexOf(".") + 1);
                        tempValue = resultArray[0] + "." + (resultArray[1] ? resultArray[1].substring(0, subLength) : '0');
                    }
                } else {
                    tempValue = resultArray[0];
                }


                return tempValue;
            }

            /**
             *   说明: 设置文本框的光标位置
             *   参数: 文本框对象 {dom object}, 光标的位置 {int}
             * 返回值: {void}
             */
            function setTxtCursorPosition(txtObj, pos) {

                var tempObj = txtObj;
                var cursurPosition = -1;

                if (tempObj.selectionStart != undefined) { //非IE浏览器
                    tempObj.setSelectionRange(pos, pos);
                } else { //IE
                    var range = tempObj.createTextRange();
                    range.move("character", pos);
                    range.select();
                }
            }
        },
        getMoneyfloat: function(s) {
            if (s == '') {
                return null;
            }
            return parseFloat((s + "").replace(/[^\d\.-]/g, ""));
        },
        doFormat: function(s) {
            var _this = this;
            if (!s) return "";

            if ($.isNumeric(s)) {
                s = s.toString();
            }
            if (typeof s === 'string') {
                s = s.replace(/^(\d+)((\.\d*)?)$/, function(v1, v2, v3) {
                    return v2.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + (v3.slice(0, _this.settings.decimal + 1) || '.00');
                });
            }

            return s.replace(/^\./, "0.")
        }
    };
    return FormatNumber;
});