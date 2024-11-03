ALTER TABLE Realtime
MODIFY temp DECIMAL,
MODIFY hum DECIMAL,
MODIFY dew DECIMAL,
MODIFY wspeed DECIMAL,
MODIFY wlatest DECIMAL,
MODIFY bearing VARCHAR,
MODIFY rrate DECIMAL,
MODIFY rfall DECIMAL,
MODIFY press DECIMAL,
MODIFY currentwdir VARCHAR,
MODIFY beaufortnumber VARCHAR,
MODIFY windrun DECIMAL,
MODIFY presstrendval VARCHAR,
MODIFY rmonth DECIMAL,
MODIFY ryear DECIMAL,
MODIFY rfallY DECIMAL,
MODIFY intemp DECIMAL,
MODIFY inhum DECIMAL,
MODIFY wchill DECIMAL,
MODIFY temptrend VARCHAR,
MODIFY tempTH DECIMAL,
MODIFY TtempTH VARCHAR,
MODIFY tempTL DECIMAL,
MODIFY TtempTL VARCHAR,
MODIFY windTM DECIMAL,
MODIFY TwindTM VARCHAR,
MODIFY wgustTM DECIMAL,
MODIFY TwgustTM VARCHAR,
MODIFY pressTH DECIMAL,
MODIFY TpressTH VARCHAR,
MODIFY pressTL DECIMAL,
MODIFY TpressTL VARCHAR,
MODIFY version VARCHAR,
MODIFY build VARCHAR,
MODIFY wgust DECIMAL,
MODIFY heatindex DECIMAL,
MODIFY Humidex DECIMAL,
MODIFY UV DECIMAL,
MODIFY ET DECIMAL,
MODIFY SolarRad DECIMAL,
MODIFY avgbearing VARCHAR,
MODIFY rhour DECIMAL,
MODIFY forecastnumber VARCHAR,
MODIFY isdaylight VARCHAR,
MODIFY SensorContactLost VARCHAR,
MODIFY wdir VARCHAR,
MODIFY cloudbasevalue VARCHAR,
MODIFY apptemp DECIMAL,
MODIFY SunshineHours DECIMAL,
MODIFY CurrentSolarMax DECIMAL,
MODIFY IsSunny VARCHAR,
MODIFY FeelsLike DECIMAL;


ALTER TABLE Monthly
MODIFY Temp DECIMAL,
MODIFY Humidity DECIMAL,
MODIFY Dewpoint DECIMAL,
MODIFY Windspeed DECIMAL,
MODIFY Windgust DECIMAL,
MODIFY Windbearing VARCHAR,
MODIFY RainRate DECIMAL,
MODIFY TodayRainSoFar DECIMAL,
MODIFY Raincounter DECIMAL,
MODIFY InsideTemp DECIMAL,
MODIFY InsideHumidity DECIMAL,
MODIFY LatestWindGust DECIMAL,
MODIFY WindChill DECIMAL,
MODIFY HeatIndex DECIMAL;

ALTER TABLE Dayfile
MODIFY HighWindGust DECIMAL,
MODIFY HWindGBear VARCHAR,
MODIFY THWindG VARCHAR,
MODIFY MinTemp DECIMAL,
MODIFY TMinTemp VARCHAR,
MODIFY MaxTemp DECIMAL,
MODIFY TMaxTemp VARCHAR,
MODIFY MinPress DECIMAL,
MODIFY TMinPress VARCHAR,
MODIFY MaxPress DECIMAL,
MODIFY TMaxPress VARCHAR,
MODIFY MaxRainRate DECIMAL,
MODIFY TMaxRR VARCHAR,
MODIFY TotRainFall DECIMAL,
MODIFY AvgTemp DECIMAL,
MODIFY TotWindRun DECIMAL;
