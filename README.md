# rTime
Sometimes actions speak louder than words:

| Original                    | rTime |
| ------                      | ----- |
| `new Date(1435982400000);`  | `rTime(1435982400000);`
| `new Date(2012, 0);`        | `rTime(2012);`
| `new Date().getTime();`     | `rTime.ms();`
| `new Date(new Date().getFullYear(), 1, 1, 14);` | `rTime({'month': 2, 'hour': 14});`
| `new Date().getFullYear();` | `rTime.getLocal.year(rTime())`
| `new Date().getUTCHours();` | `rTime.get.hour(rTime());`
| `new Date().getTimezoneOffset();` | `rTime.get.minutesToUTC(rTime());`


From Examples (todo: link)

## Description
rTime is a static, relatively low-level library for creating and retrieving data from Date objects, dealing with the `Date`oddities _so we don't have to_. It from the desire to prevent exasperated face-palms while working with the `Date` object and its many, many quirks:

* Months are zero-based
* Timezone insanity
* `Date.prototype` function name shenanigans
* Other tricky arcane nonsense

For what I needed, a full-blown [Moment](http://momentjs.com/)-like solution would be like hammering in a finishing nail with a sledgehammer. I couldn't find anything that would stick to just helping me smooth over `Date` potholes, however, and I could not abide such wanton dependencies, so rTime was born.

The name was picked because: it's short, "time" makes much more sense than "date", "r" can stand for multiple desirable traits - right, regular, revised... and also because the first attempt at a name, "Fixed And Relative Time," had a terrible acronym.

## Differences Between `Date` and rTime
Most differences are small fixes for the annoying, treacherous, or otherwise suboptimal: 

* `Date` months are zero-based, so 1 === February
	* in rTime, as in reality, month 1 === January
* The original `Date` naming is madness, so rTime makes [some adjustments](#time-field-names) from [their originals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) for consistency and/or accuracy. For familiarity, alias functions have been included using their [original names](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
	* No aliases work in [time field objects](#time-field-objects)
* `Date#getTimezoneOffset()` is backwards
	* If you're in GMT-0400 (UTC minus 4 hours), `Date` will give you `240` instead of `-240`
	* rTime adds some clearer functions:
		* `rTime.getLocal.[ms/minutes/hours]ToUTC()`
		* `rTime.getLocal.[ms/minutes/hours]FromUTC()`
	* `rTime.[get/getLocal].timezoneOffset()` is aliased (`rTime.getLocal.minutesToUTC()`)
* Call style is more functional than OOP

One sweeping difference is in priorities. For both `Date` and rTime, all dates are stored as UTC, most often as a conversion from local time. `Date` prioritizes making the simple things easy most of the time, but that makes things difficult sometimes, such as [relative date/time calculations or changing the nature of a date/time](#advanced-date-time-manipulation).

rTime attempts to prioritize the latter by explicitly requiring the word "local" whenever a conversion from UTC to local time occurs.

Here's a comparison:

| Intention | Original | `rTime` |
| --------- | -------- | ------- |
| Retrieve a field in local time | `Date#get[FieldName]()` | `rTime.getLocal.[fieldName](aDate)`
| Retrieve a field in UTC (stored) time | `Date#getUTC[FieldName]()` | `rTime.get.[fieldName](aDate)`

## Installation
### Get From NPM
Yes (todo)

### Download
Yes (todo: named links to dist, lib in repo)

### Formats
* ES6 Module
* CJS/Node Module
* AMD Module
* ES5 Script

### Dependencies
None

### API
JSDoc API documentation can be accessed one of three ways:

* The docs/JSDoc folder in the repo. It's always frustrating when library or tool projects don't include their generated files, so I'm including them all.
* Github Pages (todo)
* Clone the repo, `npm i`, then `npm run build`.

todo: links

## Usage
rTime is a better option than the `Date` API basically every time, but there are a smaller number of situations where it provides a critical advantage.

Note: Unlike Moment, JQuery, the like, there is no such thing as "an rTime object" for function chaining: it's just plain old Date objects all the way down.

### Common `Date` Usage
In most scenarios, rTime's biggest benefit is removing [foot](http://www.stroustrup.com/bs_faq.html#really-say-that) [guns](https://github.com/stepframe/Style-Guide#brendan-eich-the-creator-of-javascript-talks-a-lot-about-foot-guns): it's easier, less error-prone, provides the option of using [time field objects](#time-field-objects). And because it's fashioned after `Date`, it's still pretty familiar.

### Advanced Date/Time Manipulation
Working with different relationships of date/times, which is theoretically fairly simple, is where rTime really comes into its own:

* Calculating relative times, like the distance between two date/times
* Converting a fixed time to a user-relative time, and vice-versa
	* Fixed times, the default behavior of `Date`, don't change the actual point in time just because you change timezones; these are helpful for meetings, appointments, and other group events.
		* A 9:00 AM phone call scheduled from New York will turn into a 6:00 AM call if you take the call in Los Angeles
	* User-Relative Times that are always report the same time no matter where you go
		* e.g. "do [x] every day at 9:00 AM" is always 9:00 AM whether in New York or LA

Moment could easily handle these things. However, that is still overkill because it also does every other conceivable time-related thing, and therefore unnecessarily fat.

### Creating a `Date`
`rTime()` and `rTime.ms()` accept anything `new Date()` can, but with a couple differences:

* Months are one-based, so as not to cause further needless suffering in the world
* A single-argument number less than 10,000 is a number that *looks* like a year, so rTime *treats it* like a year.
	* rTime adds a month argument if the number looks like a year, for instance: `rTime(1920)` becomes `new Date(1920, 0)`

`rTime()` and `rTime.ms()` can also:
* Accept a time field object(time-field-objects)
* Accept an array of any kind of arguments####Time Field Naming
rTime uses slightly different names for everything, because most of the names used by `Date` could use improvement. For familiarity, all the original names are aliased for every function.

### Time Field Names
rTime tries to be as consistent as possible, especially with function and field names. For familiarity, there are alias functions for each of the original `Date`-style names.

**Note**: [Time Field Objects](#time-field-objects) do not support any aliases.

Here is what rTime calls everything:

| Original | `rTime` | Additional Aliases | Notes
| -------- | ------- | ------------------ | -----
| fullYear | year    |                    | `Date#getYear()` is completely excluded because it's totally vestigial
| month    | month   |                    | rTime's `month` is always one-based
| date     | dayOfMonth |                 | "date" is ambiguous
| day      | day     | "dayOfWeek", for consistency with "dayOfMonth" |
| hours    | hour    |                    | doesn't make any sense to pluralize any of the time values when you're referencing a single point in time
| minutes  | minute  |                    |
| seconds  | second  |                    |
| milliseconds | ms  | "millisecond"      | maybe the long form would have been a more sensible default, but why type the whole thing out?

For example, if you wish to retrieve the current day of the month, these both work:
```javascript
// preferred clear name
rTime.getLocal.dayOfMonth(rTime());
// original ambiguous `Date` name
rTime.getLocal.date(rTime());
```

### Time Field Objects
Sometimes clarity helps more than brevity. Either way, rTime has it covered. rTime allows for new date/times to be created by passing in a key/value object with any desired fields. They use the rTime standard field names and behaviors.

Time Field Objects can have zero or more fields, in any order, and can be "sparsely" populated. The format is simple; here are a couple examples:

```javascript
const allFields = {
	'year': 2011,
	'month': 2,
	'dayOfMonth': 13,
	'hour': 14,
	'minute': 15,
	'second': 16,
	'ms': 170
}

const aCoupleFields = {
	'hour': 14,
	'minute': 30
}

// maybe the object is created from user input
const stillOkay = {}
```
