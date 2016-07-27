#rTime Examples
All examples are called from EDT (Eastern Daylight [savings] Time), GMT-0400. Please infer the "current" date/time from the examples themselves.

###Creating New Dates
####(Upgraded) Date Alias
rTime:
```javascript
rTime();
rTime(2015, 7, 4);
rTime(1435982400000);
rTime(2012);
```
> Date 2016-07-26T19:59:01.478Z  
> Date 2015-07-04T04:00:00.000Z  
> Date 2015-07-04T04:00:00.000Z  
> Date 2012-01-01T05:00:00.000Z (GMT-5, date is in January)

Vanilla JS:
```javascript
new Date();
new Date(2015, 6, 4);
new Date(1435982400000);
new Date(2012);
```
(bold values are probably not intended results, unless you thoroughly grok `Date` and are very conscientious)
> Date 2016-07-26T19:59:01.478Z  
> Date 2015-**07**-04T04:00:00.000Z  
> Date 2015-07-04T04:00:00.000Z  
> Date **1970**-01-01T**00**:00:**02.012**Z (GMT-5, date is in January)

**Note** : rTime doesn't change the behavior differences in creating a `Date` using time fields (convert to UTC from local) vs a time value (assume UTC, store as is).

####The Present Date/Time Time Value (ms since midnight on January 1, 1970)
rTime:
```javascript
rTime.ms();
```
Vanilla JS:
```javascript
new Date().getTime();
```
> 1469548106190

####Specified Date/Time Time Value
rTime:
```javascript
rTime.ms(2014, 5);
```
Vanilla JS:
```javascript
new Date(2014, 4).getTime();
```
Results:
> 1398916800000

####Time Field Objects
Here are three date/times created three different ways:

rTime, time field objects:
```javascript
rTime({
	'year': 2011,
	'month': 2,
	'dayOfMonth': 3,
	'hour': 4,
	'minute': 5,
	'second': 6,
	'ms': 7
});
rTime({
	'month': 2,
	'hour': 14
});
rTime({
	'hour': 3,
	'minute': 45
});
```
rTime, `new Date()` style:
```javascript
rTime(2011,2,3,4,5,6,7);

const now = rTime();
rTime(rTime.getLocal.year(now), 2, rTime.getLocal.dayOfMonth(now), 14);
rTime(rTime.getLocal.year(now), rTime.getLocal.month(now), 3, 4);
```
Vanilla JS:
```javascript
new Date(2011,1,3,4,5,6,7);

const now = new Date();
new Date(now.getFullYear(), 1, now.getDate(), 14);
new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 45);
```
Results:
> Date 2011-02-03T09:05:06.007Z (February = GMT-0500)  
> Date 2016-02-26T05:14:00.000Z (February = GMT-0500)  
> Date 2016-07-26T07:45:00.000Z

#####11am next January 21st: Four Ways
rTime, time field object:
```javascript
const year = rTime.get.year(rTime()) + 1;

rTime({
	year,
	'month': 1,
	'dayOfMonth': 21,
	'hour': 11
});
```
rTime, traditional `new Date()` style:
```javascript
rTime(rTime.getLocal.year(rTime()) + 1, 1, 21, 11);
```
Vanilla JS:
```javascript
const nextYear = new Date().getFullYear() + 1;

new Date(nextYear, 0, 21, 11);
```
Vanilla JS, single mutated object variation:
```javascript
const nextJan = new Date();
nextJan.setYear(nextJan.getFullYear() + 1);
nextJan.setMonth(0);
nextJan.setDate(21);
nextJan.setHours(11);
nextJan.setMinutes(0);
nextJan.setSeconds(0);
nextJan.setMilliseconds(0);
```
> "Date 2017-01-21T16:00:00.000Z"

This is not an excellent use case for either time field objects or a mutable single object, but hopefully it demonstrates the clarity that comes from a clear, declarative format, even at its worst.
###Extracting Date/Time Values
####Get Current Year
Vanilla JS:
```javascript
new Date().getFullYear();
```
rTime:
```javascript
rTime.getLocal.year(rTime());
```
> 2016
