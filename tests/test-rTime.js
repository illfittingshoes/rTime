/*
 * IMPORTANT: make sure your test server is set to local time rather than UTC (default)
 */


/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { expect } from 'chai';
import rTime            from '../source/rTime';

// time object field test values
const timeObjectAllFields = {
	year: 2015,
	month: 3,
	dayOfMonth: 25,
	hour: 2,
	minute: 3,
	second: 4,
	ms: 5,
};
const timeObjectSparse = {
	minute: 13,
	ms: 115,
	dayOfMonth: 5,
};
const timeObjectEmpty = {};
const getterTestDateTime = new Date(2016, 4, 21, 21, 35);

describe('The `rTime()` `Date` factory given', () => {
	describe('no arguments', () => {
		it('should return a `Date` with the current local date/time', () => {
			const actual = rTime().getTime() - new Date().getTime();
			const maxDifference = 100;

			expect(actual).to.be.at.most(maxDifference);
		});
	});

	describe('only a `Date`', () => {
		it('should return it as-is', () => {
			const someDate = new Date();
			const actual = rTime(someDate);
			const expected = someDate;

			expect(actual).to.equal(expected);
		});
	});

	describe('only a single number less than five digits, positive or negative', () => {
		it('should treat it as a year', () => {
			const actual = rTime(9999).getTime()
				+ rTime(1).getTime()
				+ rTime(-999).getTime();
			const expected = new Date(9999, 0).getTime()
				+ new Date(1, 0).getTime()
				+ new Date(-999, 0).getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('only a number five digits or greater', () => {
		it('should treat it as a Time Value', () => {
			const actual = rTime(10000).getTime() + rTime(1000000).getTime();
			const expected = 10000 + 1000000;

			expect(actual).to.equal(expected);
		});
	});

	describe('only a single string', () => {
		// `new Date()` with a string are unusual. Compared to non-string constructor arguments:
		// - correct month instead of zero-based
		// - UTC time instead of local
		it('should return a `Date` with the expected, local time'
			+ ' if the string is valid for `new Date()`', () => {
			const actual = [
				rTime('2015-03-25').getTime(),
				rTime('03/25/2015').getTime(),
				rTime('2015/03/25').getTime(),
				rTime('Mar 25 2015').getTime(),
				rTime('25 Mar 2015').getTime(),
				rTime('Wednesday March 25 2015').getTime(),
			];
			const original = new Date(2015, 2, 25).getTime();
			const expected = [original, original, original, original, original, original];

			expect(actual).to.deep.equal(expected);
		});

		it('should return an invalid `Date` if string invalid for `new Date()`', () => {
			const actual = isNaN(rTime('not a real date').getTime());
			const expected = true;

			expect(actual).to.equal(expected);
		});
	});
	describe('only a single array', () => {
		it('should traverse all nested single arrays to use innermost arguments directly', () => {
			const actual = rTime([1000000]).getTime()
				+ rTime(['2015-03-25']).getTime()
				+ rTime([2015, 3, 25]).getTime()
				+ rTime([[[2015, 3, 25]]]).getTime();
			const expected = 1000000
				+ rTime('2015-03-25').getTime()
				+ rTime(2015, 3, 25).getTime()
				+ rTime(2015, 3, 25).getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('a series of numbers', () => {
		it('should return a `Date` with the correct local time', () => {
			const actual = rTime(2014, 3, 2, 1).getTime();
			const expected = new Date(2014, 2, 2, 1).getTime();

			expect(actual).to.equal(expected);
		});
	});

	// timeFieldHashes are objects with rTime-style time field keys, and their intended values. rules:
	// 1. They can have zero or more fields specified
	// 2. rTime() is used for any missing fields
	// 3. Exception to 2: once any field, left to right, uses a specified value, remaining
	// 	non-specified values are the lowest value for that field (0, or 1 for month and dayOfMonth)
	describe('a single timeFieldHash', () => {
		it('should behave according to time hash rules', () => {
			const actual = rTime(timeObjectAllFields).getTime()
				+ rTime(timeObjectSparse).getTime()
				+ rTime(timeObjectEmpty).getTime();

			const now = new Date();
			const expected = (
				  new Date(2015, 2, 25, 2, 3, 4, 5).getTime()
				+ new Date(now.getFullYear(), now.getMonth(), 5,
					0, 13, 0, 115).getTime()
				+ now.getTime()
			);

			expect(actual).to.equal(expected);
		});
	});

	// two or more time field hashes get Object.assign()-ed
	// 	in the same order (least -> most priority)
	describe('multiple timeFieldHashes', () => {
		it('should merge them and return a `Date` according to time hash rules', () => {
			const actual = rTime(timeObjectAllFields, timeObjectSparse).getTime();
			const expected = new Date(2015, 2, 5, 2, 13, 4, 115).getTime();

			expect(actual).to.equal(expected);
		});
	});
});
describe('The `rTime.ms()` `Date` factory', () => {
	const someDate = new Date(2014, 3, 23);
	const normalVariations = [
		[someDate],
		[9999],
		[1],
		[-999],
		[10000],
		[1000000],
		['2015-03-25'],
		['03/25/2015'],
		['2015/03/25'],
		['Mar 25 2015'],
		['25 Mar 2015'],
		['Wednesday March 25 2015'],
		[[1000000]],
		[['2015-03-25']],
		[[2015, 3, 25]],
		[[[[2015, 3, 25]]]],
		[2014, 3, 2, 1],
		[timeObjectAllFields],
		[timeObjectSparse],
		[timeObjectEmpty],
		[timeObjectAllFields, timeObjectSparse],
	];

	describe('with no arguments', () => {
		it('should mirror the rTime() API and return the same date/times as ms Time Values', () => {
			expect(rTime().getTime()).to.equal(rTime.ms());
		});
	});

	describe('with an invalid argument', () => {
		it('should mirror the rTime() API and return the same date/times as ms Time Values', () => {
			expect(
				isNaN(rTime('not a real date').getTime())
			).to.equal(
				isNaN(rTime.ms('not a real date'))
			);
		});
	});

	normalVariations.forEach((variation) => {
		describe(`with "${variation}" arguments`, () => {
			it('should mirror the rTime() API and return the same date/times as ms Time Values', () => {
				expect(rTime(...variation).getTime()).to.equal(rTime.ms(...variation));
			});
		});
	});
});

/*
 * Get/GetUTC/GetLocal Function Tests
 */
function testGetterObjectFunctions(getterObjectName, functions) {
	return functions.forEach((getter) => {
		const { name, aliases, dateEquivalent, dateFormula } = getter;
		const dateValue = getterTestDateTime[dateEquivalent]();
		const finalDateValue = dateFormula
			? dateFormula(dateValue)
			: dateValue;

		describe(`"${name}"`, () => {
			it('should be the same as the Date equivalent', () => {
				expect(
					rTime[getterObjectName][name](getterTestDateTime)
				).to.equal(
					finalDateValue
				);
			});

			if (aliases) {
				aliases.forEach((alias) => {
					describe(`alias "${alias}"`, () => {
						it('should be the same as the Date equivalent', () => {
							expect(
								rTime[getterObjectName][alias](getterTestDateTime)
							).to.equal(
								finalDateValue
							);
						});
					});
				});
			}
		});
	});
}

describe('rTime.getUTC getter', () => {
	it('should be an alias of "rTime.get"', () => {
		expect(rTime.getUTC).to.equal(rTime.get);
	});
});

describe('rTime.get (UTC) getter', () => {
	const getFunctions = [
		{
			name: 'timeValue',
			aliases: ['timeInMs', 'time'],
			dateEquivalent: 'getTime',
		},
		{
			name: 'year',
			aliases: ['fullYear'],
			dateEquivalent: 'getUTCFullYear',
		},
		{
			name: 'month',
			dateEquivalent: 'getUTCMonth',
			dateFormula: (result) => result + 1,
		},
		{
			name: 'dayOfMonth',
			aliases: ['date'],
			dateEquivalent: 'getUTCDate',
		},
		{
			name: 'day',
			aliases: ['dayOfWeek'],
			dateEquivalent: 'getUTCDay',
		},
		{
			name: 'hour',
			aliases: ['hours'],
			dateEquivalent: 'getUTCHours',
		},
		{
			name: 'minute',
			aliases: ['minutes'],
			dateEquivalent: 'getUTCMinutes',
		},
		{
			name: 'second',
			aliases: ['seconds'],
			dateEquivalent: 'getUTCSeconds',
		},
		{
			name: 'ms',
			aliases: ['millisecond', 'milliseconds'],
			dateEquivalent: 'getUTCMilliseconds',
		},
		{
			name: 'timezoneOffset',
			dateEquivalent: 'getTimezoneOffset',
		},
	];

	testGetterObjectFunctions('get', getFunctions);
});

describe('rTime.getLocal getter', () => {
	const getLocalFunctions = [
		{
			name: 'year',
			aliases: ['fullYear'],
			dateEquivalent: 'getFullYear',
		},
		{
			name: 'month',
			dateEquivalent: 'getMonth',
			dateFormula: (result) => result + 1,
		},
		{
			name: 'dayOfMonth',
			aliases: ['date'],
			dateEquivalent: 'getDate',
		},
		{
			name: 'day',
			aliases: ['dayOfWeek'],
			dateEquivalent: 'getDay',
		},
		{
			name: 'hour',
			aliases: ['hours'],
			dateEquivalent: 'getHours',
		},
		{
			name: 'minute',
			aliases: ['minutes'],
			dateEquivalent: 'getMinutes',
		},
		{
			name: 'second',
			aliases: ['seconds'],
			dateEquivalent: 'getSeconds',
		},
		{
			name: 'ms',
			aliases: ['millisecond', 'milliseconds'],
			dateEquivalent: 'getMilliseconds',
		},
		{
			name: 'msToUTC',
			dateEquivalent: 'getTimezoneOffset',
			dateFormula: result => result * 60 * 1000,
		},
		{
			name: 'minutesToUTC',
			aliases: ['timezoneOffset'],
			dateEquivalent: 'getTimezoneOffset',
		},
		{
			name: 'hoursToUTC',
			dateEquivalent: 'getTimezoneOffset',
			dateFormula: result => result / 60,
		},
		{
			name: 'msFromUTC',
			dateEquivalent: 'getTimezoneOffset',
			dateFormula: result => -result * 60 * 1000,
		},
		{
			name: 'minutesFromUTC',
			dateEquivalent: 'getTimezoneOffset',
			dateFormula: result => -result,
		},
		{
			name: 'hoursFromUTC',
			dateEquivalent: 'getTimezoneOffset',
			dateFormula: result => -result / 60,
		},
	];

	testGetterObjectFunctions('getLocal', getLocalFunctions);
});

/*

	describe('', () => {
		it('should use it', () => {
			const actual = rTime().getTime();
			const expected = new Date().getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('', () => {
		it('should use it', () => {
			const actual = rTime().getTime();
			const expected = new Date().getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('', () => {
		it('should use it', () => {
			const actual = rTime().getTime();
			const expected = new Date().getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('', () => {
		it('should use it', () => {
			const actual = rTime().getTime();
			const expected = new Date().getTime();

			expect(actual).to.equal(expected);
		});
	});

	describe('', () => {
		it('should use it', () => {
			const actual = rTime().getTime();
			const expected = new Date().getTime();

			expect(actual).to.equal(expected);
		});
	});*/
