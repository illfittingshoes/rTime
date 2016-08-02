(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.rTime = mod.exports['default'];
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = rTime;

	function _defineProperty(obj, key, value) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
		} else {
			obj[key] = value;
		}

		return obj;
	}

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

	function _toConsumableArray(arr) {
		if (Array.isArray(arr)) {
			for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
				arr2[i] = arr[i];
			}

			return arr2;
		} else {
			return Array.from(arr);
		}
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	/**
  * Create and interact with JS Date objects consistently and easily. rTime is
  * a static, low-level library that uses and returns standard JS Date objects. It has no state,
  * and there is no "rTime" type. You're dealing with the same old object, just via a less
  * ambiguous and confusing interface. Compared to vanilla Date, rTime:
  * Allows creating a new Date without manually specifying every field,
  * such as when only time of day matters. Accepts broader string formats. Provides additional
  * straightforward UTC <-> Local time zone helpers. Disambiguates some field names (but aliases in
  * original names to prevent frustration). Makes months one-based. Always returns UTC values
  * by default,and getting a field value in local time is always explicit. As a shortcut, rTime.ms()
  * may be used to return a Time Value (ms) number instead of a Date object.
  * Note: It may not seem necessary for some fields, like "year", to have "UTC" and "local"
  * variations, but that starts to make a difference around December 31.
  * @module rTime
  */

	// eslint doesn't like this complex set of acceptable params
	// eslint-disable valid-jsdoc
	/**
  * Entry point function accepts various forms of time information: Usual Date values - single
  * string describing full date/time; single number (Time Value); a series of numbers
  * for date/time fields; a key/value object with time field names and numeric values. Has
  * object properties "get", "getUTC" (just an alias of "get"), and "getLocal" to group accessor
  * functions. Also has an "ms()" function property to return a Time Value instead of a Date object
  *
  * @param {(string|...number|...timeFieldHash|Date)}
  *         [timeArgs]
  *         Any of several formats for desired time parameters
  *
  * @return {Date} new Date(), created using arguments. Will be "Invalid Date" object
  *   if arguments don't eventually resolve to a real date
  *
  * @example
  * // all return the same as new Date() would
  * rTime();
  * rTime({});
  * rTime([]);
  *
  * @example
  * // both return the same as Date.now()
  * rTime.ms();
  * rTime.get.timeValue(rTime());
  *
  * @example
  * <caption>The following, when called in 2016 within the eastern time zone,
  * returns "Date 2016-02-01T16:00:00.000Z" (in Firefox. Chrome and Edge always
  * report the local conversion)</caption>
  * // equivalent to new Date(2016, 1, 1, 11)
  * rTime({
  * 	month: 2,
  * 	hour: 11
  * });
  */
	// eslint-enable valid-jsdoc
	function rTime() {
		for (var _len = arguments.length, timeArgs = Array(_len), _key = 0; _key < _len; _key++) {
			timeArgs[_key] = arguments[_key];
		}

		var numberOfArgs = timeArgs.length;
		var firstArg = timeArgs[0];
		var firstArgType = typeof firstArg === 'undefined' ? 'undefined' : _typeof(firstArg);

		if (numberOfArgs === 0 || firstArg === null) {
			return new Date();
		}

		// single valid arg - either an array of values to try as args, a timeFieldHash,
		// or string, possibly user input
		if (numberOfArgs === 1) {
			// rTime(aDate) just returns the date
			if (firstArg instanceof Date) {
				return firstArg;
			}

			// allow an array, why not. Recurse.
			if (Array.isArray(firstArg)) {
				return rTime.apply(undefined, _toConsumableArray(firstArg));
			}

			// date/time string - valid, or returns Invalid Date object
			if (firstArgType === 'string') {
				return getExpectedDateFromString(firstArg);
			}

			if (firstArgType === 'number') {
				// exception to date rules: if the only argument is a number less
				// than five digits, treat it as a year rather than a time value (ms)
				if (firstArg < 10000) {
					return new Date(firstArg, 0);
				}

				return new Date(firstArg);
			}
		}

		if (numberOfArgs > 1) {
			if (firstArgType === 'number') {
				var month = adjustMonthToDate(timeArgs[1]);

				return new (Function.prototype.bind.apply(Date, [null].concat([firstArg, month], _toConsumableArray(timeArgs.slice(2)))))();
			}

			// TODO: first arg object, second arg array
			// TODO: arrays(contents following above object, array format)
		}

		// one or more args made it through the filters
		if (firstArgType === 'object') {
			// plain object (non-Array, non-Null, non-Date) is a timeFieldHash
			if (Object.keys(firstArg).length) {
				return makeTimeFromFields.apply(undefined, timeArgs);
			}

			return new Date();
		}

		return new Date('one or more invalid arguments');
	}

	function adjustMonthToDate(month) {
		// e.g. if the user puts in 3, they mean March not April
		return month - 1;
	}

	function adjustMonthFromDate(month) {
		// if rTime retrieves a month from a date, that number is low by 1
		return month + 1;
	}

	function getExpectedDateFromString(dateString) {
		// date/time from strings breaks with typical `new Date() behavior`:
		// - month is correct
		// - IF string is ISO format, it creates in UTC time rather than local
		var rawDate = new Date(dateString);
		var isISO = /^\d{4,6}-\d{2}-\d{2}$/.test(dateString);

		return isISO ? new Date(rawDate.getTime() + rawDate.getTimezoneOffset() * 60 * 1000) : rawDate;
	}

	// eslint doesn't like this complex set of acceptable params
	// eslint-disable valid-jsdoc
	/**
  * Same as rTime(), but returns a Time Value rather than a Date
  * @function ms
  * @param {(string|...number|...timeFieldHash)}
  *         [timeArgs]
  *         Any of several formats for desired time parameters
  * @return {number}
  *         Time Value (ms since 01/01/1970 UTC)
  */
	// eslint-enable valid-jsdoc
	rTime.ms = function ms() {
		if (arguments.length === 0) {
			return Date.now();
		}

		return rTime.get.timeInMs(rTime.apply(undefined, arguments));
	};

	/**
  * Object format to make new Date()s out of partial bits of information
  * @typedef {Object} timeFieldHash
  * @property {number|Date} year four digits or a date to extract that value from
  * @property {number|Date} month 1-12 or a date to extract that value from
  * @property {number|Date} dayOfMonth 1-31 or a date to extract that value from
  * @property {number|Date} hour 0-23 or a date to extract that value from
  * @property {number|Date} minute 0-59 or a date to extract that value from
  * @property {number|Date} second 0-59 or a date to extract that value from
  * @property {number|Date} ms millisecond 0-999 or a date to extract that value from
  * @property {boolean} isUTC new time should be in UTC rather than local
  */

	/**
  * Generates new Date object with incomplete information. Follows one rule: From
  * longest to shortest (year -> ms), use a fallback for unspecified fields. Until a field has been
  * specified, use the current time. Afterward, use either 0 (most fields) or 1 (month, dayOfMonth).
  * @protected
  * @param {...timeFieldHash} fieldHashes
  *         One or more hashes of field names and values. Note "day",
  * "dayOfMonth", and "ms" fields rather than "day", "date", and "milliseconds". The first two are
  * ambiguous, and "ms" is just much easier and a well-used abbreviation
  *
  * @throws Will throw if there are no objects passed (empty object(s) are okay - returns new Date())
  *
  * @return {Date} new Date() created with values from all hashes. Will create in UTC time
  * (equivalent to new Date(Date.UTC())) one of the hashes includes: "isUTC": true
  */
	function makeTimeFromFields() {
		for (var _len2 = arguments.length, fieldHashes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			fieldHashes[_key2] = arguments[_key2];
		}

		if (fieldHashes.length === 0) {
			throw new Error('making time from fields requires at least one fields object.' + 'This should never trigger, as it is only called internally.');
		}
		var nowDate = new Date();
		var allFields = fieldHashes.reduce(function (accumulator, hash) {
			if ((typeof hash === 'undefined' ? 'undefined' : _typeof(hash)) === 'object' && !Array.isArray(hash) && hash !== null && Object.keys(hash).length > 0) {
				return _extends({}, accumulator, hash);
			}

			return accumulator;
		}, {});

		if (Object.keys(allFields).length === 0) {
			return nowDate;
		}

		var getLocal = rTime.getLocal;

		var nowValues = {
			year: getLocal.year(nowDate),
			month: getLocal.month(nowDate),
			dayOfMonth: getLocal.dayOfMonth(nowDate),
			hour: getLocal.hour(nowDate),
			minute: getLocal.minute(nowDate),
			second: getLocal.second(nowDate),
			ms: getLocal.ms(nowDate)
		};

		function reduceFields(_ref, fieldName) {
			var prevDoUseMinValue = _ref.prevDoUseMinValue;
			var latestValues = _ref.latestValues;
			var defaults = _ref.defaults;

			var rawFieldValue = allFields[fieldName];
			var newFieldValue = rawFieldValue instanceof Date ? getLocal[fieldName](rawFieldValue) : rawFieldValue;
			var newFieldObject = newFieldValue ? _defineProperty({}, fieldName, newFieldValue) : {};

			var doUseMinValue = prevDoUseMinValue ? true : !!newFieldValue;

			// work around JS treating days and months like they're zero-based
			var minFieldValue = fieldName === 'month' || fieldName === 'dayOfMonth' ? 1 : 0;

			var fallbackValue = doUseMinValue === true ? _defineProperty({}, fieldName, minFieldValue) : _defineProperty({}, fieldName, defaults[fieldName]);

			return {
				prevDoUseMinValue: doUseMinValue,
				latestValues: _extends({}, latestValues, fallbackValue, newFieldObject),
				defaults: defaults
			};
		}

		var fullValues = Object.keys(nowValues).reduce(reduceFields, {
			prevDoUseMinValue: false,
			latestValues: {},
			defaults: nowValues
		});

		var _fullValues$latestVal = fullValues.latestValues;
		var year = _fullValues$latestVal.year;
		var month = _fullValues$latestVal.month;
		var dayOfMonth = _fullValues$latestVal.dayOfMonth;
		var hour = _fullValues$latestVal.hour;
		var minute = _fullValues$latestVal.minute;
		var second = _fullValues$latestVal.second;
		var ms = _fullValues$latestVal.ms;


		if (allFields.isUTC) {
			// convert month number to zero-based
			return new Date(Date.UTC(year, adjustMonthToDate(month), dayOfMonth, hour, minute, second, ms));
		}

		// convert month number to zero-based
		return new Date(year, adjustMonthToDate(month), dayOfMonth, hour, minute, second, ms);
	}

	/**
  * Holds function properties for extracting individual values from a given date in UTC time.
  * All return values are retrieved using Date.prototype.getUTC[field](). Has an alias
  * called "getUTC"
  * @see  rTime~getUTC
  * @namespace rTime~get
  * @type {object.<function>}
  * @example
  * // get the year of a given date
  * rTime.get.year(someDate)
  */
	rTime.get = {
		timeValue: function timeValue(d) {
			return d.getTime();
		},
		year: function year(d) {
			return d.getUTCFullYear();
		},
		month: function month(d) {
			return adjustMonthFromDate(d.getUTCMonth());
		},
		dayOfMonth: function dayOfMonth(d) {
			return d.getUTCDate();
		},
		day: function day(d) {
			return d.getUTCDay();
		},
		hour: function hour(d) {
			return d.getUTCHours();
		},
		minute: function minute(d) {
			return d.getUTCMinutes();
		},
		second: function second(d) {
			return d.getUTCSeconds();
		},
		ms: function ms(d) {
			return d.getUTCMilliseconds();
		},
		timeInMs: function timeInMs(d) {
			return this.timeValue(d);
		},
		time: function time(d) {
			return this.timeValue(d);
		},
		fullYear: function fullYear(d) {
			return this.year(d);
		},
		date: function date(d) {
			return this.dayOfMonth(d);
		},
		dayOfWeek: function dayOfWeek(d) {
			return this.day(d);
		},
		hours: function hours(d) {
			return this.hour(d);
		},
		minutes: function minutes(d) {
			return this.minute(d);
		},
		seconds: function seconds(d) {
			return this.second(d);
		},
		milliseconds: function milliseconds(d) {
			return this.ms(d);
		},
		millisecond: function millisecond(d) {
			return this.ms(d);
		},
		timezoneOffset: function timezoneOffset(d) {
			return rTime.getLocal.minutesToUTC(d);
		}
	};

	/**
  * Alias of "get"
  * @namespace rTime~getUTC
  * @see rTime~get
  */
	rTime.getUTC = rTime.get;

	/**
  * Holds function properties for extracting individual values from a given date in Local Time.
  * All return values are converted from UTC to in the user's current time zone, using the built-in
  * Date.prototype.get[field] function.
  * @namespace rTime~getLocal
  * @type {object.<function>}
  * @example
  * // get the year of a given date
  * rTime.getLocal.year(someDate)
  *
  * @example
  * // how many hours to add to convert a specified time from "local" to "fixed"
  * // (useful for showing the time a user originally entered regardless of time zone, by both
  * // storing the time in UTC and displaying in UTC)
  * rTime.getLocal.hoursToUTC(someDate)
  */
	rTime.getLocal = {
		year: function year(d) {
			return d.getFullYear();
		},
		month: function month(d) {
			return adjustMonthFromDate(d.getMonth());
		},
		dayOfMonth: function dayOfMonth(d) {
			return d.getDate();
		},
		day: function day(d) {
			return d.getDay();
		},
		hour: function hour(d) {
			return d.getHours();
		},
		minute: function minute(d) {
			return rTime.get.minute(d);
		},
		second: function second(d) {
			return rTime.get.second(d);
		},
		ms: function ms(d) {
			return rTime.get.ms(d);
		},
		msToUTC: function msToUTC(d) {
			return d.getTimezoneOffset() * 60 * 1000;
		},
		minutesToUTC: function minutesToUTC(d) {
			return d.getTimezoneOffset();
		},
		hoursToUTC: function hoursToUTC(d) {
			return d.getTimezoneOffset() / 60;
		},
		msFromUTC: function msFromUTC(d) {
			return -d.getTimezoneOffset() * 60 * 1000;
		},
		minutesFromUTC: function minutesFromUTC(d) {
			return -d.getTimezoneOffset();
		},
		hoursFromUTC: function hoursFromUTC(d) {
			return -d.getTimezoneOffset() / 60;
		},
		fullYear: function fullYear(d) {
			return this.year(d);
		},
		dayOfWeek: function dayOfWeek(d) {
			return this.day(d);
		},
		date: function date(d) {
			return this.dayOfMonth(d);
		},
		hours: function hours(d) {
			return this.hour(d);
		},
		minutes: function minutes(d) {
			return this.minute(d);
		},
		seconds: function seconds(d) {
			return this.second(d);
		},
		milliseconds: function milliseconds(d) {
			return this.ms(d);
		},
		millisecond: function millisecond(d) {
			return this.ms(d);
		},
		timezoneOffset: function timezoneOffset(d) {
			return rTime.getLocal.minutesToUTC(d);
		}
	};
});
//# sourceMappingURL=rTime.js.map
