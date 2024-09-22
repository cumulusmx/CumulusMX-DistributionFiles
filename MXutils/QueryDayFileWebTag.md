<!--
    Last updated:  2024/09/20 14:48:49
-->
# Web Tag QueryDayFile
The web tag takes the form:
```go
<#QueryDayFile value=MinTemp function=min [where=>10] dateFrom=2023-01-01 [dateTo=2024-01-01] [resfunc=max] [showDate=y] [format="date_format"] [dp=N] [tc=y] [rc=y]>
```

**If there is an existing web tag for the value you require, please use that specific tag rather than this general query. The specific tag is likely be *much* more efficient.**

## Parameters
### value:
Required. The name of the value int he day file to query.

Possible value strings:

    HighGust
    WindRun
    HighAvgWind

    LowTemp
    HighTemp
    AvgTemp
    HighHeatIndex
    HighAppTemp
    LowAppTemp
    LowWindChill
    HighDewPoint
    LowDewPoint
    HighFeelsLike
    LowFeelsLike
    HighHumidex

    LowPress
    HighPress

    HighRainRate
    TotalRain
    HighHourlyRain
    HighRain24h

    LowHumidity
    HighHumidity

    SunShineHours
    HighSolar
    HighUv
    ET

    HeatingDegreeDays
    CoolingDegreeDays
    ChillHours


### function:
Required. The name of the function to apply to the value.

Possible function strings:

    min, max, avg, sum, count

### where:
Required if function = count.

Criteria applied to the count. This is a comparison value, so for example you want to count days where the minimum temperature was below zero °C you would use where=<0.

You can use the following comparison strings:

    >, <, >=, <=, =

### dateFrom:
Required. The start date of the query.

It can be any date string that can be parsed by the "yyyy-MM-dd" format.<br>
OR<br>
It can be one of the following special values:

    ThisMonth, ThisYear, Month-[N], Year-[N], Month[N], Yearly

    ThisMonth and ThisYear are self explanatory.
    Month-N and Year-N are used to specify the relative month or year. For example Month-1 = the previous month to current.
    MonthN is used to find values for any year for the specified month. N = 1 to 12.
    Yearly groups the results by year

The value is found for dates >= dateFrom.

### dateTo:
Optional if dateFrom has one of the special values.

Required if dateFrom is a date string - format "yyyy-MM-dd"

The value is found for dates <= dateTo

### resFunc:
Result function.

Mandatory for grouped results, ie those using the date options: Month-[N], Year-[N], Month[N], Yearly

Controls if the largest or smallest value for the grouped period is returned.

Must be one of the following:

    min, max


### showDate:
Optional.

If omitted, then the web tag returns only the numeric value.

If present, the the web tag returns a pair of strings, the value itself, and the date-time it occurred in the format: ["value","datetime_string"]

The parameter showdate should not be used if the function is one of "avg", "sum", or "count". If specified for these functions it returns a datetime_string of "-".

### format:
Optional. The standard date formatting string used by all date-time web tags.

### dp:
Optional. The standard decimal place definer used by all numeric web tags, it defaults to dp=1

### tc:
Optional. The standard truncate definer used by all numeric web tags. If present it truncates the value to an integer (dp=0 will round the value to an integer).

This parameter is automatically added if the function is "count"

### rc:
Optional. The standard remove commas definer used by all numeric web tags. If omitted decimals are output in locale format, if present decimals are always output with a dot decimal point.

## Examples
The maximum sun hours in a day this year and the date on which it occurred:

    <#QueryDayFile value=SunShineHours function=max from=ThisYear showDate=y dp=2 format="dd-MM-yyyy">

    returns: ["12.32","26-07-2024"]

The total sun hours last year:

    <#QueryDayFile value=SunShineHours function=sum from=Year-1 dp=2>

    returns: 1287.22

Highest sun hours in any year, and the year it occurred:

    <#QueryDayFile value=SunShineHours function=sum from=Yearly resFunc=max dp=2 showDate=y format=yyyy>

    returns: ["1405.9","2018"]

The total evapotranspiration last month:

    <#QueryDayFile value=DayEVT> function=sum from=Month-1 dp=2>

    returns: 23.56

The average maximum UV-I in April & May 2024:

    <#QueryDayFile value=HighUv function=avg from=2024-04-01 to=2024-06-01>

    returns: 4.5

The lowest minimum temperature that has occurred in any December (*NOTE: in reality there is standard web tag for this <#ByMonthTempL>*):

    <#QueryDayFile value=LowTemp function=min from=Month12 resFunc=min showDate=y>

    returns: ["-12.5","20/12/2010 07:17"]

The highest minimum temperature that has occurred in any December (*NOTE: in reality there is standard web tag for this <#ByMonthMinTempH>*):

    <#QueryDayFile value=LowTemp function=max from=Month12 resFunc=max showDate=y>

    returns: ["12.1","19/12/2015 00:36"]

