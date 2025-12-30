<?php
$time_start = microtime(true);
//-----------------------------------------------------------------
// Import Cumulus Monthly Log file into MySql database
// Author: David A Jamieson, daj@findmyinbox.co.uk
//
// Ver 1.1b - 04/02/10
// Ver 1.1c - 11/03/10
// ver 1.2  - 06/05/11, Mark Crossley, updated for Cumulus 1.9.1
// ver 1.3  - 27/11/12, Mark Crossley, updated for Cumulus b1050
// ver 1.3a - 30/11/12, Mark Crossley, added line breaks to text output
// ver 1.3b - 30/11/12, Mark Crossley, changed so ALL missing values from
//            from the dayfile are entered into the table as NULL. If you have
//            used the Cumulus editor, then they will be present in the file as
//            blank fields.
// ver 1.4  - 04/12/12, Mark Crossley, added realtime logging
// ver 1.4a - 04/12/12, Mark Crossley Fixed syntax errors, added parameter presence checking.
// ver 1.4b - 07/12/12, Mark Crossley Tidying
// ver 2.0  - 20/12/12, Mark Crossley
//           * Change monthly and realtime tables to use combined date/time columns rather than separate
//           * Added optional retention time for realtime table. Records older than
//             the specified age will be deleted. retainVal=NNN retainUnit=XXXX
//           * Added checking to allow running of the script from a command line as well as via http
//           * Added 'extra' columns to record wind directions as compass points where they are only provided as bearings:
//              Dayfile:  Added the following columns:- HWindGBearSym, DomWindDirSym
//              Monthly:  Added the following columns:- WindbearingSym, CurrWindBearingSym
// ver 2.1  - 29/03/13, Mark Crossley
//           * Fixed typo in day file table field name LowDewPint -> LowDewPoint
// ver 2.2  - 21/05/13, Mark Crossley
//           * Made dayfile UV a decimal(3,1) field rather than varchar(4)
// ver 2.3  - 05/06/13, Mark Crossley
//           * Fixed dayfile & monthfile table column HoursSun was decimal(2,1) to decimal(3,1)
// ver 2.4  - 23/10/13, Mark Crossley
//           * Changed day file humidity fields from varchar(3) to decimal(4,1)
// ver 2.5  - 03/12/13, Mark Crossley
//           * Changed day file HighSolarRad from varchar(5) to decimal(5,1)
//              To alter an existing table...
//              ALTER TABLE `dayfile` CHANGE `HighSolarRad` `HighSolarRad` DECIMAL(5,1) NULL DEFAULT NULL
// ver 2.6  - 02/04/14, Mark Crossley
//           * Fixed PHP vulnerability that could reveal the passcode
// ver 2.7  - 22/02/15, Mark Crossley
//           * Fixed realtime/monthly/day tables creates, to make rainfall 2dp to allow for inches
//           * Fixed monthly table create, to make evapotrans 2 dp
//           * Converted from depreciated mysql to mysqli
// ver 2.8  - 27/04/15, Mark Crossley
//           * Added addtional configuration parameter $rainUnit, default is 'mm'
//           * Added 'rain since midnight' to the monthly log file table
//           * This version is REQUIRED to support CumulusMX direct inserts
//           * Altered layout the SQL statements to make finding/fixing stuff easier!
//           * To updated existing monthly tables use the following SQL command [if you use 'mm' for rain change (4,2) to (4,1)]:
//             ALTER TABLE <<YOUR_MONTHLY_TABLENAME>> ADD COLUMN RainSinceMidnight DECIMAL(4,2) NULL AFTER RG11rain;
// ver 3.0  - 03/11/16, Mark Crossley
//           * Converted to use prepared statements - more efficient for bulk inserts (the main use for this
//              script with CumulusMX?)
//           * SQL injection protection improved - requires the table names to be defined in this script
// ver 3.1  - 01/03/18, Mark Crossley
//           * Fix variable typos in realtime table creation status messages
//           * Remove some HTTP headers that were causing problems on some servers
// ver 3.2  - 11/09/18, Ramon Bakker/Mark Crossley
//           * Fixed inserting of WindbearingSym and CurrWindBearingSym
// ver 4.0  - 04/05/20, Mark Crossley
//           * Updated for CMX 3.6.0 addition of Feels Like
// ver 4.1  - 05/05/20, Mark Crossley
//           * Fix for files that do not have the required number of fields
// ver 4.2 -  18/08/2020, Steinar Utne:
//			* Added Humidex in dayfile and monthly
// ver 4.3 -  01/0809/2020, Steinar Utne
//			* If monthly and $auto_month=true then construct filename from date (i.e. <dir>MonYYlog.txt) rather than read from parameters
// ver 5.0 - 18/12/2025, Mark Crossley
//          * Updated for CumulusMX 4.7.0 - Note this is not backward compatible with earlier Cumulus versions
//-----------------------------------------------------------------
//
// USING THIS SCRIPT
//
// Currently you can import two file types from Cumulus -- the dayfile and the Monthly log files.
//
// Firstly decide the table to be populated in your SQL database.  If the table does not exist
// the script will create it.  Typically you have one table for the dayfile, and one or more for the
// Monthly Logs.  You could import every monthly log file into one large SQL table.
// If you re-import existing data the script will update the data in the table so you can run the
// import every day on the same file, dayfile, for example
//
//
// You must pass several options with your URL...
// They can be in any order but the first one must start with ? other with &
//
// type=xxxx
//    this must be either the phrase dayfile, monthly, or realtime
//
// file=xxxxx
//    the location on your webserver, relative to this script location, of your Cumulus File
//    example file=dayfile.txt  or file=../data/dayfile.txt
//
// table=xxxx
//    the table within SQL to import the data.  If it does not exist the script will create it
//
// key=xxxxx
//    A security key, unique to you, to pass as part of the URL.  This stops others from
//    running the script on your server if the do not know the key.
//
// retainVal=nnn [optional]
//    The elapsed of 'retainUnit's to keep in the realtime table. Records older than nnnUnits will be deleted.
//
// retainUnit=xxxx [optional, mandatory if retainVal supplied]
//    The units to be applied to retainVal, valid values are: second, minute, hour, day, week, month, quarter, or year
//
//  Example URLs...
//    http://www.myserver.com/ImportCumulusFile.php?type=dayfile&key=letmein&file=/data/dayfile.txt
//    http://www.myserver.com/ImportCumulusFile.php?type=monthly&key=letmein&file=/data/202512log.txt
//    http://www.myserver.com/ImportCumulusFile.php?type=realtime&key=letmein&file=/realtime.txt&retainVal=10&retainUnit=hour
//
// COMMAND LINE
// It is also possible to run this script from a PHP command line, eg via a cron job in Linux, or a scheduled task in Windows.
// Example of a 'Windows' command line...
//    php importcumulusfile.php file=realtime.txt table=Realtime type=realtime key=letmein retainVal=48 retainUnit=hour
//

// EDIT THIS NEXT SECTION CAREFULLY
// ----------------------------------------------------------------
// Your security key you will pass in the URL, change this to
// something unique to you
$key = 'letmein';
//
// The server host name or number running your MySQL database
// usually 127.0.0.1 or localhost will suffice
//$dbhost = '127.0.0.1';
//
// The username used to log-in to your database server
//$dbuser = 'user';
//
// The password used to log-in to your database server
//$dbpassword = 'password';
//
// The name of the MySQL database we will store the tables in
//$database = 'database';
//
// A better way of entering your login details is to put them in a separate script
// and include this here. This script should be placed in an area accessible to PHP
// but not web users. Your login details will not then be exposed by crashing this
// script.
// e.g. ...

include '../private/db_rw_details.php';

// Enable debug messages? Disable for production use
$debug = false;


$rainUnit = 'mm'; // mm or in
$compassp = array('N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW');

// Change the second parameter to your MySQL table name if different from below
$tableNames = array(
    'monthly'  => 'Monthly',
    'realtime' => 'Realtime',
    'dayfile'  => 'Dayfile'
);

// Generate name of monthly-file  <dir>YYYYMMlog.txt
$auto_month = false;            // True: generate from date, false: read from params
$month_file_dir= './data/';   // Directory where monthly log file is stored

//
//-----------------------------------------------------------------
// --------- Nothing to edit below here ---------------------------
//-----------------------------------------------------------------
$validtypes = array('dayfile', 'monthly', 'realtime');
$validunits = array('second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year');
$mandatoryVars = array('file', 'type', 'key');
$param_retainVal = 0;
$param_retainUnit = '';
$createQuery = '';
$insertQuery = '';
$deleteQuery = '';
$windBearField = null;
$endFieldCount = null;
$typeString = '';
$rainDec = $rainUnit === 'mm' ? 1 : 2; // number of decimal places to store on rain fields

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');
header("Transfer-Encoding: chunked");

// disable output buffering
while (ob_get_level() > 0) {
    ob_end_flush(); // Closes the topmost buffer
}

// ---- Validation checks ----

// Are we running from a command line?
if (PHP_SAPI === 'cli') {
    // Running from command line, push arguments into http argument $_GET array
    // format so that we use one set of parameter checking code
    parse_str(implode('&', array_slice($argv, 1)), $_GET);
    $web = false;
    $lf = "\n";
    output('Running from CLI'.$lf);
} else {
    $web = true;
    $lf = "<br>\r\n";
    //header('Content-Encoding', 'chunked');
    //header('Transfer-encoding: chunked');
    header('Content-Type: text/html');
    //header('Connection', 'keep-alive');
    output('Running from web server');
}

output('Script version 5.0');

// scan for the mandatory script parameters
foreach ($mandatoryVars as $p) {
    if (isset($_GET[$p])) {
        // store param value in variable prefixed with 'param_' + name
        ${"param_$p"} = $_GET[$p];
        // PHP 5.4 - isset() no longer returns false is value is null, so explicitly check it
        if (${"param_$p"} === '') {
            die("Error: You must supply a value for the '$p' parameter");
        }
    } else {
        die("Error: You must supply a '$p' parameter/value");
    }
}

// check type param value is valid
if (!in_array($param_type, $validtypes)) {
    die("Error: Invalid import 'type' supplied - '$param_type'");
}

// use lookup array for table name to prevent SQL injection
$tableName = $tableNames[$param_type];

// check for optional realtime parameters
if ($param_type === 'realtime') {
    if (isset($_GET['retainVal'])) {
        $param_retainVal = intval($_GET['retainVal']);
        // if retainVal is supplied, then retainUnit is mandatory
        if (isset($_GET['retainUnit'])) {
            $param_retainUnit = strtolower($_GET['retainUnit']);
            // check retainUnit param value is valid
            if (!in_array($param_retainUnit, $validunits)) {
                die("Error: Invalid import 'type' supplied - '$param_type'");
            }
        } else {
            die('Error: If you supply "retainVal", then "retainUnit" must also be provided');
        }
    }
}
// Insert Monthly file_name from date; su 1/9-20
if ($param_type ==='monthly' AND $auto_month) {
    $param_file =$month_file_dir .  date('YM', strtotime($currentdate.'- 1days')) . 'log.txt';
}

// check for the 'security' key
if ($key !== '' && $param_key !== $key) {
    die('Error: Failed security key check:' . $param_key);
}

//
// ---- End validation checks ----
//

output('Script start: ' . date('y/m/d H:i:s', time()));
output("Importing file: $param_file, To table: $tableName ...");

$handle = @fopen($param_file, 'r');
if ($handle) {
    // Connect to the database
    $mysqli = new mysqli($dbhost, $dbuser, $dbpassword, $database);
    if ($mysqli->connect_errno) {
        die('Failed to connect to the database server - ' . $mysqli->connect_error);
    } else {
        output('Connected to database OK.');
    }

    // Ensure no TZ conversions take place
    $result = $mysqli->query("SET time_zone='+0:00'");
    if (!$result) {
        fclose($handle);
        $mysqli->close();
        die('ERROR - TZ Statement');
    } else {
        output('Set MySQL TZ OK.');
    }

    // Construct the required SQL statements
    $colCount = prepareQueries($param_type, $tableName, $param_retainVal, $param_retainUnit);

    // check if the table is available
    $result = $mysqli->query("SHOW TABLES LIKE '$tableName'");
    if ($result->num_rows == 0) {
        // no table, so create it
        output("Table '$tableName' does not exist, creating it...");
        if ($web) {
            flush();
        }
        if (!$mysqli->query($createQuery)) {
            fclose($handle);
            output("ERROR - Failed to create table: $tableName $lf MySQL Error: " . $mysqli->error . $lf . "SQL Statement: $createQuery");
            $mysqli->close();
            die('End.');
        } else {
            output("Table '$tableName' created OK.");
        }
    } else {
        output('Target table already exists.');
    }

    // prepare the SQL ready for the parameters
    $insert = $mysqli->prepare($insertQuery);
    if (!$insert) {
        fclose($handle);
        output("ERROR - Failed to prepare the insert statement: $tableName, error: " . $mysqli->error . $lf . $insertQuery);
        $mysqli->close();
        die('End.');
    } else {
        output('Prepared SQL statement OK.');
        if ($debug) {
            output("SQL: $insertQuery $lf");
        }
    }

    output('Running data inserts... ');
    $rowsInserted = 0;
    while (!feof($handle)) {
        $buffer = fgets($handle);

        $buf_arr = explode(',', $buffer);
        $recs = count($buf_arr);
        if ($buf_arr[0] != '') {
            // number of fields we need to process
            $endCount = $colCount - count($windBearField);
            // format the date -- this assumes dd/mm/yy but will convert to a format for SQL: yy-mm-dd
            $datearr = explode('/', $buf_arr[0]);
            if ($param_type === 'dayfile' || $param_type === 'realtime') {
                // dayfile
                $dtimestamp = $datearr[2] . '-' . $datearr[1] . '-' . $datearr[0];
                $i = 1;
            } else {
                // monthly tables have a unix timestamp in the second field
                $dtimestamp = date('Y-m-d H:i:s', intval($buf_arr[1]));
                $i = 2;
                $endCount++;
            }

            // Create the binding parameters
            // Put them in an array for ease of handling
            $bindParams = array();
            // first the timestamp
            $bindParams[] = $dtimestamp;
            // now the rest
            for (; $i < $endCount; $i++) {
                if (isset($buf_arr[$i])) {
                    $buf_arr[$i] = str_replace(array("\r", "\n"), '', $buf_arr[$i]);
                    if ($i > $recs or trim($buf_arr[$i]) === '') {  // no data in file
                        $bindParams[] = 'NULL';
                    } else { // we have some data
                        $bindParams[] = $buf_arr[$i];
                    }
                } else {
                    $bindParams[] = 'NULL';
                }
            }

            // Append extra columns for wind directions as symbols
            if ($param_type === 'dayfile' || $param_type === 'monthly') {
                $count = count($windBearField);
                for ($i = 0; $i < $count; $i++) {
                    // Calculate the compass points based on the bearings
                    if ($windBearField[$i] >= $recs or trim($buf_arr[$windBearField[$i]]) === '') {
                        $bindParams[] = 'NULL';
                    } else {
                        $bindParams[] = $compassp[((((int)$buf_arr[$windBearField[$i]] + 11) / 22.5) % 16)];
                    }
                }
            }

            if ($debug) {
                output('Insert bind values = ' . implode(',',$bindParams));
            }
            // Now we have all the values to insert in an array, we can call the mysqli->bind_param() via call_user_func_array()
            // mysqli->bind parameters requires parameters pass by reference - grr!
            $typeArray = array($typeString);
            $result = call_user_func_array(array(&$insert, 'bind_param'), refValues(array_merge($typeArray, $bindParams)));
            if (!$result) {
                fclose($handle);
                $mysqli->close();
                die($lf . 'Error: Failed to bind the SQL parameters!');
            } else {
                // Execute the insert
                $result = $insert->execute();
                if (!$result) {
                    fclose($handle);
                    output($lf . 'Error: Failed to insert data, error is: ' . $mysqli->error);
                    $mysqli->close();
                    die('End.');
                } elseif ($mysqli->affected_rows) {
                    $rowsInserted++;
                    output('+', false);
                }
                //else {
                //    output('.', false);
                //}
            }
        }
    }
    fclose($handle);
    output('');
    output("Data insert done, $rowsInserted rows inserted");
    if ($param_type === 'realtime' && $param_retainVal > 0) {
        output('Deleting old realtime records...');
        $result = $mysqli->query($deleteQuery);
        if (!$result) {
            output('Error: Failed to delete records, error is: ' . $mysqli->error . $lf . 'SQL was:' . $lf . $deleteQuery);
        } else {
            output('done. Deleted ' . $mysqli->affected_rows . ' old rows.');
        }
    }
    $mysqli->close();
} else {
    output("Error: Failed to open file: '$param_file'");
}
output('Script complete: ' . date('y/m/d H:i:s', time()) . $lf . 'Execution time: ' . round(microtime(true) - $time_start, 1) . ' secs');

// =================================================== END OF MAIN SCRIPT ===================================================

function prepareQueries($queryType, $table, $retainVal, $retainUnit)
{
    global  $createQuery, $insertQuery, $deleteQuery, $typeString, $debug,
            $windBearField, $lf, $field_delimiter, $date_format, $rainDec;
    // Setup the variables depending on what type of file we are importing -- Day file or Monthly Log

    if ($queryType === 'dayfile') {
        output('Processing dayfile...');
        // List the table columns (and types) in an array - easier to edit!
        $columns = array(
            array('LogDate',        'date NOT NULL'),                           // 0
            array('HighWindGust',   'decimal(4,1) NOT NULL'),                   // 1
            array('HWindGBear',     'smallint(3) unsigned zerofill NOT NULL'),  // 2
            array('THWindG',        'varchar(5) NOT NULL'),                     // 3
            array('MinTemp',        'decimal(5,1) NOT NULL'),                   // 4
            array('TMinTemp',       'varchar(5) NOT NULL'),                     // 5
            array('MaxTemp',        'decimal(5,1) NOT NULL'),                   // 6
            array('TMaxTemp',       'varchar(5) NOT NULL'),                     // 7
            array('MinPress',       'decimal(6,2) NOT NULL'),                   // 8
            array('TMinPress',      'varchar(5) NOT NULL'),                     // 9
            array('MaxPress',       'decimal(6,2) NOT NULL'),                   // 10
            array('TMaxPress',      'varchar(5) NOT NULL'),                     // 11
            array('MaxRainRate',    "decimal(4,$rainDec) NOT NULL"),            // 12
            array('TMaxRR',         'varchar(5) NOT NULL'),                     // 13
            array('TotRainFall',    "decimal(6,$rainDec) NOT NULL"),            // 14
            array('AvgTemp',        'decimal(4,2) NOT NULL'),                   // 15
            array('TotWindRun',     'decimal(5,1) NOT NULL'),                   // 16
            array('HighAvgWSpeed',  'decimal(3,1)'),                            // 17
            array('THAvgWSpeed',    'varchar(5)'),                              // 18
            array('LowHum',         'decimal(4,1)'),                            // 19
            array('TLowHum',        'varchar(5)'),                              // 20
            array('HighHum',        'decimal(4,1)'),                            // 21
            array('THighHum',       'varchar(5)'),                              // 22
            array('TotalEvap',      "decimal(5,$rainDec)"),                     // 23
            array('HoursSun',       'decimal(3,1)'),                            // 24
            array('HighHeatInd',    'decimal(4,1)'),                            // 25
            array('THighHeatInd',   'varchar(5)'),                              // 26
            array('HighAppTemp',    'decimal(4,1)'),                            // 27
            array('THighAppTemp',   'varchar(5)'),                              // 28
            array('LowAppTemp',     'decimal(4,1)'),                            // 29
            array('TLowAppTemp',    'varchar(5)'),                              // 30
            array('HighHourRain',   "decimal(4,$rainDec)"),                     // 31
            array('THighHourRain',  'varchar(5)'),                              // 32
            array('LowWindChill',   'decimal(4,1)'),                            // 33
            array('TLowWindChill',  'varchar(5)'),                              // 34
            array('HighDewPoint',   'decimal(4,1)'),                            // 35
            array('THighDewPoint',  'varchar(5)'),                              // 36
            array('LowDewPoint',    'decimal(4,1)'),                            // 37
            array('TLowDewPoint',   'varchar(5)'),                              // 38
            array('DomWindDir',     'smallint(3) unsigned zerofill'),           // 39
            array('HeatDegDays',    'decimal(4,1)'),                            // 40
            array('CoolDegDays',    'decimal(4,1)'),                            // 41
            array('HighSolarRad',   'decimal(5,1)'),                            // 42
            array('THighSolarRad',  'varchar(5)'),                              // 43
            array('HighUV',         'decimal(3,1)'),                            // 44
            array('THighUV',        'varchar(5)'),                              // 45
            array('MaxFeelsLike',   'decimal(4,1)'),                            // 48
            array('TMaxFeelsLike',  'varchar(5)'),                              // 49
            array('MinFeelsLike',   'decimal(4,1)'),                            // 50
            array('TMinFeelsLike',  'varchar(5)'),                              // 51
            array('MaxHumidex',     'decimal(5,1)'),                            // 52
            array('TMaxHumidex',    'varchar(5)'),                              // 53
            array('ChillHours',     'decimal(7,1)'),                            // 54
            array('HighRain24h',    'decimal(6,,2)'),                           // 55
            array('THighRain24h',   'varchar(5)'),                              // 56
            array('HWindGBearSym',  'varchar(3)'),                              // 46
            array('DomWindDirSym',  'varchar(3)')                               // 47
        );
        // Construct the SQL strings from the array
        // start
        $createQuery = "CREATE TABLE $table (";
        $insertQuery = "INSERT IGNORE INTO $table (";
        // add column names
        foreach ($columns as $col) {
            $createQuery .= "$col[0] $col[1],";
            $insertQuery .= "$col[0],";
        }
        // table info
        $createQuery .= 'PRIMARY KEY(LogDate)) COMMENT = "Dayfile from Cumulus"';
        $insertQuery = substr($insertQuery, 0, -1);                             // trim last comma
        // insert a ? for every field value as we are late binding
        $insertQuery .= ') VALUES (' . str_repeat('?,', count($columns));
        $insertQuery = substr($insertQuery, 0, -1);                             // trim last comma
        $insertQuery .= ')';

        $windBearField = array(2, 39);
        $numberOfColumns = count($columns);
        if ($debug) {
            output('Insert = '. $insertQuery);
        }
    } elseif ($queryType === 'monthly') {
        output('Processing monthfile...');
        // List the table columns (and types) in an array - easier to edit!
        $columns = array(                                                           // DB - Cumulus logfile
            array('LogDateTime',        'DATETIME NOT NULL'),                       // 0  - 1
            array('Temp',               'decimal(4,1) NOT NULL'),                   // 1  - 2
            array('Humidity',           'decimal(4,1) NOT NULL'),                   // 2  - 3
            array('Dewpoint',           'decimal(4,1) NOT NULL'),                   // 3  - 4
            array('Windspeed',          'decimal(4,1) NOT NULL'),                   // 4  - 5
            array('Windgust',           'decimal(4,1) NOT NULL'),                   // 5  - 6
            array('Windbearing',        'smallint(3) unsigned zerofill NOT NULL'),  // 6  - 7
            array('RainRate',           "decimal(4,$rainDec) NOT NULL"),            // 7  - 8
            array('TodayRainSoFar',     "decimal(4,$rainDec) NOT NULL"),            // 8  - 9
            array('Pressure',           'decimal(6,2) NOT NULL'),                   // 9  - 10
            array('Raincounter',        'decimal(6,2) NOT NULL'),                   // 10 - 11
            array('InsideTemp',         'decimal(4,1) NOT NULL'),                   // 11 - 12
            array('InsideHumidity',     'decimal(4,1) NOT NULL'),                   // 12 - 13
            array('LatestWindGust',     'decimal(5,1) NOT NULL'),                   // 13 - 14
            array('WindChill',          'decimal(4,1) NOT NULL'),                   // 14 - 15
            array('HeatIndex',          'decimal(4,1) NOT NULL'),                   // 15 - 16
            array('UVindex',            'decimal(4,1)'),                            // 16 - 17
            array('SolarRad',           'decimal(5,1)'),                            // 17 - 18
            array('Evapotrans',         'decimal(4,1)'),                            // 18 - 19
            array('AnnualEvapTran',     'decimal(5,1)'),                            // 19 - 20
            array('ApparentTemp',       'decimal(4,1)'),                            // 20 - 21
            array('MaxSolarRad',        'decimal(5,1)'),                            // 21 - 22
            array('HrsSunShine',        'decimal(3,1)'),                            // 22 - 23
            array('CurrWindBearing',    'varchar(3)'),                              // 23 - 24
            array('RG11rain',           'decimal(4,1)'),                            // 24 - 25
            array('RainSinceMidnight',  'decimal(4,1)'),                            // 25 - 26
            array('FeelsLike',          'decimal(4,1)'),                            // 27
            array('Humidex',             'decimal(4,1)'),                           // 30
            array('WindbearingSym',     'varchar(3)'),                              // 28
            array('CurrWindBearingSym', 'varchar(3)')                               // 29
        );

        // Construct the SQL strings from the array
        // start
        $createQuery = "CREATE TABLE $table (";
        $insertQuery = "INSERT IGNORE INTO $table (";
        // add column names
        foreach ($columns as $col) {
            $createQuery .= "$col[0] $col[1],";
            $insertQuery .= "$col[0],";
        }
        // table info
        $createQuery .= 'PRIMARY KEY(LogDateTime)) COMMENT = "Monthly logs from Cumulus"';
        $insertQuery = substr($insertQuery, 0, -1);                             // trim last comma
        $insertQuery .= ') VALUES (' . str_repeat('?,', count($columns));
        // insert a ? for every field value as we are late binding
        $insertQuery = substr($insertQuery, 0, -1);                             // trim last comma
        $insertQuery .= ')';

        $windBearField = array(7, 24);                                          // Indexes into Cumulus log file
        $numberOfColumns = count($columns);
        if ($debug) {
            output('Insert = '. $insertQuery);
        }
    } elseif ($queryType === 'realtime') {
        output('Processing realtime file...');
        $field_delimiter = ' ';    //fixed delimiter in realtime.txt, so over-ride any user setting
        $date_format = 'DMY';    //fixed date format in realtime.txt, so over-ride any user setting
        // List the table columns (and types) in an array - easier to edit!
        $columns = array(                                                           // DB - Cumulus file
            array('LogDateTime',        'DATETIME NOT NULL'),                       // 0  - 0, 1
            array('temp',               'decimal(4,1) NOT NULL'),                   // 1  - 2
            array('hum',                'decimal(4,1) NOT NULL'),                   // 2  - 3
            array('dew',                'decimal(4,1) NOT NULL'),                   // 3  - 4
            array('wspeed',             'decimal(4,1) NOT NULL'),                   // 4  - 5
            array('wlatest',            'decimal(4,1) NOT NULL'),                   // 5  - 6
            array('bearing',            'smallint(3) zerofill unsigned NOT NULL'),  // 6  - 7
            array('rrate',              "decimal(4,$rainDec) NOT NULL"),            // 7  - 8
            array('rfall',              "decimal(4,$rainDec) NOT NULL"),            // 8  - 9
            array('press',              'decimal(6,2) NOT NULL'),                   // 9  - 10
            array('currentwdir',        'varchar(3) NOT NULL'),                     // 10 - 11
            array('beaufortnumber',     'varchar(2) NOT NULL'),                     // 11 - 12
            array('windunit',           'varchar(4) NOT NULL'),                     // 12 - 13
            array('tempunitnodeg',      'varchar(1) NOT NULL'),                     // 13 - 14
            array('pressunit',          'varchar(3) NOT NULL'),                     // 14 - 15
            array('rainunit',           'varchar(2) NOT NULL'),                     // 15 - 16
            array('windrun',            'decimal(4,1) NOT NULL'),                   // 16 - 17
            array('presstrendval',      'varchar(6) NOT NULL'),                     // 17 - 18
            array('rmonth',             "decimal(4,$rainDec) NOT NULL"),            // 18 - 19
            array('ryear',              "decimal(4,$rainDec) NOT NULL"),            // 19 - 20
            array('rfallY',             "decimal(4,$rainDec) NOT NULL"),            // 20 - 21
            array('intemp',             'decimal(4,1) NOT NULL'),                   // 21 - 22
            array('inhum',              'decimal(4,1) NOT NULL'),                   // 22 - 23
            array('wchill',             'decimal(4,1) NOT NULL'),                   // 23 - 24
            array('temptrend',          'varchar(5) NOT NULL'),                     // 24 - 25
            array('tempTH',             'decimal(4,1) NOT NULL'),                   // 25 - 26
            array('TtempTH',            'varchar(5) NOT NULL'),                     // 26 - 27
            array('tempTL',             'decimal(4,1) NOT NULL'),                   // 27 - 28
            array('TtempTL',            'varchar(5) NOT NULL'),                     // 28 - 29
            array('windTM',             'decimal(4,1) NOT NULL'),                   // 29 - 30
            array('TwindTM',            'varchar(5) NOT NULL'),                     // 30 - 31
            array('wgustTM',            'decimal(4,1) NOT NULL'),                   // 31 - 32
            array('TwgustTM',           'varchar(5) NOT NULL'),                     // 32 - 33
            array('pressTH',            'decimal(6,2) NOT NULL'),                   // 33 - 34
            array('TpressTH',           'varchar(5) NOT NULL'),                     // 34 - 35
            array('pressTL',            'decimal(6,2) NOT NULL'),                   // 35 - 36
            array('TpressTL',           'varchar(5) NOT NULL'),                     // 36 - 37
            array('version',            'varchar(8) NOT NULL'),                     // 37 - 38
            array('build',              'varchar(5) NOT NULL'),                     // 38 - 39
            array('wgust',              'decimal(4,1) NOT NULL'),                   // 39 - 40
            array('heatindex',          'decimal(4,1) NOT NULL'),                   // 40 - 41
            array('humidex',            'decimal(4,1) NOT NULL'),                   // 41 - 42
            array('UV',                 'decimal(3,1) NOT NULL'),                   // 42 - 43
            array('ET',                 "decimal(4,$rainDec) NOT NULL"),            // 43 - 44
            array('SolarRad',           'decimal(5,1) NOT NULL'),                   // 44 - 45
            array('avgbearing',         'smallint(3) zerofill unsigned NOT NULL'),  // 45 - 46
            array('rhour',              "decimal(4,$rainDec) NOT NULL"),            // 46 - 47
            array('forecastnumber',     'tinyint(2) unsigned NOT NULL'),            // 47 - 48
            array('isdaylight',         'tinyint(1) unsigned NOT NULL'),            // 48 - 49
            array('SensorContactLost',  'tinyint(1) unsigned NOT NULL'),            // 49 - 50
            array('wdir',               'varchar(3) NOT NULL'),                     // 50 - 51
            array('cloudbasevalue',     'int NOT NULL'),                            // 51 - 52
            array('cloudbaseunit',      'varchar(2) NOT NULL'),                     // 52 - 53
            array('apptemp',            'decimal(4,1) NOT NULL'),                   // 53 - 54
            array('SunshineHours',      'decimal(3,1) NOT NULL'),                   // 54 - 55
            array('CurrentSolarMax',    'decimal(5,1) NOT NULL'),                   // 55 - 56
            array('IsSunny',            'tinyint(1) unsigned NOT NULL'),            // 56 - 57
            array('FeelsLike',          'decimal(4,1)'),                            // 57 - 58
            array('rweek',              "decimal(4,$rainDec) NOT NULL")             // 58 - 59
        );

        // Construct the SQL strings from the array
        // start
        $createQuery = "CREATE TABLE $table (";
        $insertQuery = "INSERT IGNORE INTO $table (";
        // add column names
        foreach ($columns as $col) {
            $createQuery .= "$col[0] $col[1],";
            $insertQuery .= "$col[0],";
        }
        // table info
        $createQuery .= 'PRIMARY KEY(LogDateTime)) COMMENT = "Realtime log from Cumulus"';
        $insertQuery = substr($insertQuery, 0, -1);                         // trim last comma
        $insertQuery .= ') VALUES (' . str_repeat('?,', count($columns));
        // insert a ? for every field value as we are late binding
        $insertQuery = substr($insertQuery, 0, -1);                         // trim last comma
        $insertQuery .= ')';

        $windBearField = null;
        $numberOfColumns = count($columns);

        if ($debug) {
            output('Insert = '. $insertQuery);
        }

        if ($retainVal > 0) {
            $deleteQuery = "DELETE IGNORE FROM $table WHERE LogDateTime < DATE_SUB(NOW(), INTERVAL $retainVal $retainUnit )";
            if ($debug) {
                output('Delete = '. $deleteQuery);
            }
        }
    }
    $typeString = str_repeat('s', $numberOfColumns);
    return $numberOfColumns;
}

// Converts an array of values to an array of referenced values
// Required for calling mysqli->bind_param() via call_user_func_array
function refValues($arr)
{
    if (strnatcmp(phpversion(), '5.3') >= 0) { //Reference is required for PHP 5.3+
        $refs = array();
        foreach ($arr as $key => $value) {
            $refs[$key] = &$arr[$key];
        }
        return $refs;
    }
    return $arr;
}

// Print some output
function output($str, $newline = true)
{
    global $web, $lf;
    if ($web) {
        echo $str . str_pad('', 4096 - strlen($str) - strlen($lf)) . ($newline ? $lf : '');
        flush();
    } else {
        echo $str . ($newline ? $lf : '');
    }
}
