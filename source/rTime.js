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
export default function rTime(...timeArgs) {
	const numberOfArgs = timeArgs.length;
	const firstArg = timeArgs[0];
	const firstArgType = typeof firstArg;

	if (numberOfArgs === 0
		|| firstArg === null) {
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
			return rTime(...firstArg);
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
			const month = adjustMonthToDate(timeArgs[1]);

			return new Date(firstArg, month, ...timeArgs.slice(2));
		}

		// TODO: first arg object, second arg array
		// TODO: arrays(contents following above object, array format)
	}

	// one or more args made it through the filters
	if (firstArgType === 'object') {
		// plain object (non-Array, non-Null, non-Date) is a timeFieldHash
		if (Object.keys(firstArg).length) {
			return makeTimeFromFields(...timeArgs);
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
	const rawDate = new Date(dateString);
	const isISO = /^\d{4,6}-\d{2}-\d{2}$/.test(dateString);

	return isISO
		? new Date(rawDate.getTime() + (rawDate.getTimezoneOffset() * 60 * 1000))
		: rawDate;
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
rTime.ms = function ms(...timeArgs) {
	if (timeArgs.length === 0) {
		return Date.now();
	}

	return rTime.get.timeInMs(
		rTime(...timeArgs)
	);
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
function makeTimeFromFields(...fieldHashes) {
	if (fieldHashes.length === 0) {
		throw new Error('making time from fields requires at least one fields object.'
			+ 'This should never trigger, as it is only called internally.');
	}
	const nowDate = new Date();
	const allFields = fieldHashes
		.reduce((accumulator, hash) => {
			if (typeof hash === 'object'
				&& !Array.isArray(hash)
				&& hash !== null
				&& Object.keys(hash).length > 0
			) {
				return Object.assign({}, accumulator, hash);
			}

			return accumulator;
		}, {});

	if (Object.keys(allFields).length === 0) {
		return nowDate;
	}

	const { getLocal } = rTime;
	const nowValues = {
		year: getLocal.year(nowDate),
		month: getLocal.month(nowDate),
		dayOfMonth: getLocal.dayOfMonth(nowDate),
		hour: getLocal.hour(nowDate),
		minute: getLocal.minute(nowDate),
		second: getLocal.second(nowDate),
		ms: getLocal.ms(nowDate),
	};

	function reduceFields({ prevDoUseMinValue, latestValues, defaults }, fieldName) {
		const rawFieldValue = allFields[fieldName];
		const newFieldValue = rawFieldValue instanceof Date
				? getLocal[fieldName](rawFieldValue)
				: rawFieldValue;
		const newFieldObject = newFieldValue ? { [fieldName]: newFieldValue } : {};

		const doUseMinValue = prevDoUseMinValue
			? true
			: !!newFieldValue;

		// work around JS treating days and months like they're zero-based
		const minFieldValue = (fieldName === 'month' || fieldName === 'dayOfMonth')
			? 1
			: 0;

		const fallbackValue = (doUseMinValue === true)
			? { [fieldName]: minFieldValue }
			: { [fieldName]: defaults[fieldName] };

		return {
			prevDoUseMinValue: doUseMinValue,
			latestValues: Object.assign({}, latestValues, fallbackValue, newFieldObject),
			defaults,
		};
	}

	const fullValues = Object.keys(nowValues)
		.reduce(reduceFields, {
			prevDoUseMinValue: false,
			latestValues: {},
			defaults: nowValues,
		});

	const {
		year,
		month,
		dayOfMonth,
		hour,
		minute,
		second,
		ms,
	} = fullValues.latestValues;

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
	/**
	 * Get a given date as a Time Value: ms since 1970 began
	 * @memberof! rTime~get
	 * @param {Date} d Any Date object
	 * @return {number} milliseconds since Unix epoch
	 */
	timeValue(d) {
		return d.getTime();
	},

	/**
	 * Get the year of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} four digit year
	 */
	year(d) {
		return d.getUTCFullYear();
	},

	/**
	 * Get the one-based month number of a given date.
	 * Underlying Date object is zero-based for month, requiring simple conversion
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-12
	 */
	month(d) {
		return adjustMonthFromDate(d.getUTCMonth());
	},

	/**
	 * Get the day of the month of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-31
	 */
	dayOfMonth(d) {
		return d.getUTCDate();
	},

	/**
	 * Get the day of the week of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-6
	 */
	day(d) {
		return d.getUTCDay();
	},

	/**
	 * Get the hour of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 */
	hour(d) {
		return d.getUTCHours();
	},

	/**
	 * Get the minute of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 */
	minute(d) {
		return d.getUTCMinutes();
	},

	/**
	 * Get the second of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 */
	second(d) {
		return d.getUTCSeconds();
	},

	/**
	 * Get the millisecond (ms) of a given Date object
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-999
	 */
	ms(d) {
		return d.getUTCMilliseconds();
	},

	/*
	 * Aliases
	 */

	/**
	 * An alias of timeValue that is more immediately obvious
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} milliseconds since Unix epoch
	 * @see rTime~get.timeValue
	 */
	timeInMs(d) {
		return this.timeValue(d);
	},

	/**
	 * An alias of timeValue to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} milliseconds since Unix epoch
	 * @see rTime~get.timeValue
	 */
	time(d) {
		return this.timeValue(d);
	},

	/**
	 * An alias of year to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} four digit year
	 * @see rTime~get.year
	 */
	fullYear(d) {
		return this.year(d);
	},

	/**
	 * An alias of dayOfMonth to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-31 day number
	 * @see rTime~get.dayOfMonth
	 */
	date(d) {
		return this.dayOfMonth(d);
	},

	/**
	 * An alias of day to match dayOfMonth naming
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-6
	 */
	dayOfWeek(d) {
		return this.day(d);
	},

	/**
	 * An alias of hour to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 * @see rTime~get.hour
	 */
	hours(d) {
		return this.hour(d);
	},

	/**
	 * An alias of minute to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 * @see rTime~get.minute
	 */
	minutes(d) {
		return this.minute(d);
	},

	/**
	 * An alias of second to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 * @see rTime~get.second
	 */
	seconds(d) {
		return this.second(d);
	},

	/**
	 * An alias of ms to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-999
	 * @see rTime~get.ms
	 */
	milliseconds(d) {
		return this.ms(d);
	},

	/**
	 * A longform alias of ms
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-999
	 * @see rTime~get.ms
	 */
	millisecond(d) {
		return this.ms(d);
	},

	/**
	 * An alias of minutesToUTC to mirror the Date API
	 * @memberof! rTime~get
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59 minutes
	 * @see rTime~get.minutesToUTC
	 */
	timezoneOffset(d) {
		return rTime.getLocal.minutesToUTC(d);
	},
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
	/**
	 * Get the year of a given Date object according to local time
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} four digit year
	 */
	year(d) {
		return d.getFullYear();
	},

	/**
	 * Get the one-based month number of a given date according to local time.
	 * Underlying Date object is zero-based for month, requiring simple conversion
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-12
	 */
	month(d) {
		return adjustMonthFromDate(d.getMonth());
	},

	/**
	 * Get the day of the month of a given Date object according to local time
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-31
	 */
	dayOfMonth(d) {
		return d.getDate();
	},

	/**
	 * Get the day of the week of a given Date object according to local time
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-6
	 */
	day(d) {
		return d.getDay();
	},

	/**
	 * Get the hour of a given Date object according to local time
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 */
	hour(d) {
		return d.getHours();
	},

	/**
	 * Get the minute of a given Date object. Alias of get.minute
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 */
	minute(d) {
		return rTime.get.minute(d);
	},

	/**
	 * Get the second of a given Date object. Alias of get.second
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 */
	second(d) {
		return rTime.get.second(d);
	},

	/**
	 * Get the ms (millisecond) of a given Date object. Alias of get.millisecond
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 */
	ms(d) {
		return rTime.get.ms(d);
	},

	/**
	 * Get the number of milliseconds from the local timezone to UTC for a given Date object.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-84,600,000 ms (0-23.5 hours), converted from minutes
	 *
	 * @example
	 * // When called from Ohio, which is GMT-5, or GMT-4 during daylight savings
	 * // (useful as ms with Time Values, converted to hours here to read)
	 * rTime.get.msToUTC(rTime({"month": 2})) / 1000 / 60 / 60;
	 * // -> 5
	 * rTime.get.msToUTC(rTime({"month": 7})) / 1000 / 60 / 60;
	 * // -> 4
	 */
	msToUTC(d) {
		return d.getTimezoneOffset() * 60 * 1000;
	},

	/**
	 * Get the number of minutes from the local timezone to UTC for a given Date object.
	 * Useful for converting from local time to UTC.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-1,410 minutes (0-23.5 hours)
	 */
	minutesToUTC(d) {
		return d.getTimezoneOffset();
	},

	/**
	 * Get the number of hours from the local timezone to UTC for a given Date object.
	 * Useful for converting from local time to UTC.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23.5 hours, converted from minutes
	 */
	hoursToUTC(d) {
		return d.getTimezoneOffset() / 60;
	},

	/**
	 * Get the number of milliseconds from UTC to the local timezone for a given Date object.
	 * Useful for converting from UTC to local time.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-84,600,000 ms (0-23.5 hours), converted from minutes
	 */
	msFromUTC(d) {
		return -d.getTimezoneOffset() * 60 * 1000;
	},

	/**
	 * Get the number of minutes from UTC to the local timezone for a given Date object.
	 * Useful for converting from UTC to local time.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-1,410 minutes (0-23.5 hours)
	 */
	minutesFromUTC(d) {
		return -d.getTimezoneOffset();
	},

	/**
	 * Get the number of hours from UTC to the local timezone for a given Date object.
	 * Useful for converting from UTC to local time.
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23.5 hours, converted from minutes
	 */
	hoursFromUTC(d) {
		return -d.getTimezoneOffset() / 60;
	},

	/*
	 * Aliases
	 */

	/**
	 * An alias of year to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} four digit year
	 * @see rTime~getLocal.year
	 */
	fullYear(d) {
		return this.year(d);
	},

	/**
	 * An alias of day to match dayOfMonth naming
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-6
	 */
	dayOfWeek(d) {
		return this.day(d);
	},

	/**
	 * An alias of dayOfMonth to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 1-31 day number
	 * @see rTime~getLocal.dayOfMonth
	 */
	date(d) {
		return this.dayOfMonth(d);
	},

	/**
	 * An alias of hour to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-23
	 * @see rTime~getLocal.hour
	 */
	hours(d) {
		return this.hour(d);
	},

	/**
	 * An alias of minute to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 * @see rTime~getLocal.minute
	 */
	minutes(d) {
		return this.minute(d);
	},

	/**
	 * An alias of second to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59
	 * @see rTime~getLocal.second
	 */
	seconds(d) {
		return this.second(d);
	},

	/**
	 * An alias of ms to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-999
	 * @see rTime~getLocal.ms
	 */
	milliseconds(d) {
		return this.ms(d);
	},

	/**
	 * A longform alias of ms
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-999
	 * @see rTime~getLocal.ms
	 */
	millisecond(d) {
		return this.ms(d);
	},

	/**
	 * An alias of minutesToUTC to mirror the Date API
	 * @memberof! rTime~getLocal
	 * @param {Date} d Date object initialized with a given date/time
	 * @return {number} 0-59 minutes
	 * @see rTime~get.minutesToUTC
	 */
	timezoneOffset(d) {
		return rTime.getLocal.minutesToUTC(d);
	},
};
