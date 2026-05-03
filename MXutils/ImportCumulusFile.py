#!/usr/bin/env python3
# ------------------------------------------------------------
# Version 1.1
# Last updated: 2026/04/09 15:50:05
# ------------------------------------------------------------
# Script to import data from Cumulus MX log files into a MySQL database
# Compatible with data files from Cumulus MX v4.7.0 and later
#
# import_data.py <mode> <table_name> <file1> [file2 ...] [--dry-run]
# Modes:
#   dayfile  - imports daily summary data from DAYFILE
#   monthly  - imports monthly log data from MONTHLY log files
# Examples:
#   python import_data.py dayfile dayfile.txt
#   python import_data.py dayfile mydaytable dayfile.txt --dry-run
#   python import_data.py monthly 202512log.txt --dry-run
#   python import_data.py monthly mymonthly 202512log.txt 202511log.txt
#
# Notes:
# - The script creates the target table if it does not exist.
# - Use --dry-run to simulate the import without making changes to the database.
# - Database connection settings must be configured in the connect_db() function.
# ------------------------------------------------------------
# Requires mysql-connector-python package
# Install via: pip install mysql-connector-python
# ------------------------------------------------------------
import os
import sys
import mysql.connector
from datetime import datetime, timezone

# ------------------------------------------------------------
# Config
# ------------------------------------------------------------
BATCH_SIZE = 100   # number of rows to insert per transaction
PROGRESS_INTERVAL = 1000   # log progress every 1000 rows
DRY_RUN = False # set to True to skip DB inserts

# ------------------------------------------------------------
# Database connection
# ------------------------------------------------------------
def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="your_user",
        password="your_password",
        database="your_database",
    )

# ------------------------------------------------------------
# Compass conversion
# ------------------------------------------------------------
def degrees_to_compass_16(deg):
    directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ]
    deg = float(deg) % 360
    index = int((deg + 11.25) // 22.5) % 16
    return directions[index]


# ------------------------------------------------------------
# Utility: timestamped logging
# ------------------------------------------------------------
def log(msg):
    now = datetime.now().strftime("%H:%M:%S")
    print(f'{now}: {msg}')

# ------------------------------------------------------------
# Column definitions for DAYFILE
# ------------------------------------------------------------
DAYFILE_COLUMNS = [
    ("LogDate",        "date NOT NULL"),                           # 0
    ("HighWindGust",   "decimal(4,1) NOT NULL"),                   # 1
    ("HWindGBear",     "smallint(3) unsigned zerofill NOT NULL"),  # 2
    ("THWindG",        "varchar(5) NOT NULL"),                     # 3
    ("MinTemp",        "decimal(5,1) NOT NULL"),                   # 4
    ("TMinTemp",       "varchar(5) NOT NULL"),                     # 5
    ("MaxTemp",        "decimal(5,1) NOT NULL"),                   # 6
    ("TMaxTemp",       "varchar(5) NOT NULL"),                     # 7
    ("MinPress",       "decimal(6,2) NOT NULL"),                   # 8
    ("TMinPress",      "varchar(5) NOT NULL"),                     # 9
    ("MaxPress",       "decimal(6,2) NOT NULL"),                   # 10
    ("TMaxPress",      "varchar(5) NOT NULL"),                     # 11
    ("MaxRainRate",    "decimal(4,2) NOT NULL"),                   # 12
    ("TMaxRR",         "varchar(5) NOT NULL"),                     # 13
    ("TotRainFall",    "decimal(6,2) NOT NULL"),                   # 14
    ("AvgTemp",        "decimal(4,2) NOT NULL"),                   # 15
    ("TotWindRun",     "decimal(5,1) NOT NULL"),                   # 16
    ("HighAvgWSpeed",  "decimal(3,1)"),                            # 17
    ("THAvgWSpeed",    "varchar(5)"),                              # 18
    ("LowHum",         "decimal(4,1)"),                            # 19
    ("TLowHum",        "varchar(5)"),                              # 20
    ("HighHum",        "decimal(4,1)"),                            # 21
    ("THighHum",       "varchar(5)"),                              # 22
    ("TotalEvap",      "decimal(5,2)"),                            # 23
    ("HoursSun",       "decimal(3,1)"),                            # 24
    ("HighHeatInd",    "decimal(4,1)"),                            # 25
    ("THighHeatInd",   "varchar(5)"),                              # 26
    ("HighAppTemp",    "decimal(4,1)"),                            # 27
    ("THighAppTemp",   "varchar(5)"),                              # 28
    ("LowAppTemp",     "decimal(4,1)"),                            # 29
    ("TLowAppTemp",    "varchar(5)"),                              # 30
    ("HighHourRain",   "decimal(4,2)"),                            # 31
    ("THighHourRain",  "varchar(5)"),                              # 32
    ("LowWindChill",   "decimal(4,1)"),                            # 33
    ("TLowWindChill",  "varchar(5)"),                              # 34
    ("HighDewPoint",   "decimal(4,1)"),                            # 35
    ("THighDewPoint",  "varchar(5)"),                              # 36
    ("LowDewPoint",    "decimal(4,1)"),                            # 37
    ("TLowDewPoint",   "varchar(5)"),                              # 38
    ("DomWindDir",     "smallint(3) unsigned zerofill"),           # 39
    ("HeatDegDays",    "decimal(4,1)"),                            # 40
    ("CoolDegDays",    "decimal(4,1)"),                            # 41
    ("HighSolarRad",   "decimal(5,1)"),                            # 42
    ("THighSolarRad",  "varchar(5)"),                              # 43
    ("HighUV",         "decimal(3,1)"),                            # 44
    ("THighUV",        "varchar(5)"),                              # 45
    ("MaxFeelsLike",   "decimal(4,1)"),                            # 48
    ("TMaxFeelsLike",  "varchar(5)"),                              # 49
    ("MinFeelsLike",   "decimal(4,1)"),                            # 50
    ("TMinFeelsLike",  "varchar(5)"),                              # 51
    ("MaxHumidex",     "decimal(5,1)"),                            # 52
    ("TMaxHumidex",    "varchar(5)"),                              # 53
    ("ChillHours",     "decimal(7,1)"),                            # 54
    ("HighRain24h",    "decimal(6,2)"),                            # 55
    ("THighRain24h",   "varchar(5)"),                              # 56
    ("HighBgt",        "decimal(4,1)"),                            # 57
    ("THighBgt",       "varchar(5)"),                              # 58
    ("HighWbgt",       "decimal(4,1)"),                            # 59
    ("THighWbgt",      "varchar(5)"),                              # 60
    ("HWindGBearSym",  "varchar(3)"),                              # 46 (derived)
    ("DomWindDirSym",  "varchar(3)"),                              # 47 (derived)
]

# ------------------------------------------------------------
# Column definitions for MONTHLY
# ------------------------------------------------------------
MONTHLY_COLUMNS = [
    ("LogDateTime",        "DATETIME NOT NULL"),                       # 0
    ("Temp",               "decimal(4,1) NOT NULL"),                   # 1
    ("Humidity",           "decimal(4,1) NOT NULL"),                   # 2
    ("Dewpoint",           "decimal(4,1) NOT NULL"),                   # 3
    ("Windspeed",          "decimal(4,1) NOT NULL"),                   # 4
    ("Windgust",           "decimal(4,1) NOT NULL"),                   # 5
    ("Windbearing",        "smallint(3) unsigned zerofill NOT NULL"),  # 6
    ("RainRate",           "decimal(4,2) NOT NULL"),                   # 7
    ("TodayRainSoFar",     "decimal(4,2) NOT NULL"),                   # 8
    ("Pressure",           "decimal(6,2) NOT NULL"),                   # 9
    ("Raincounter",        "decimal(6,2) NOT NULL"),                   # 10
    ("InsideTemp",         "decimal(4,1) NOT NULL"),                   # 11
    ("InsideHumidity",     "decimal(4,1) NOT NULL"),                   # 12
    ("LatestWindGust",     "decimal(5,1) NOT NULL"),                   # 13
    ("WindChill",          "decimal(4,1) NOT NULL"),                   # 14
    ("HeatIndex",          "decimal(4,1) NOT NULL"),                   # 15
    ("UVindex",            "decimal(4,1)"),                            # 16
    ("SolarRad",           "decimal(5,1)"),                            # 17
    ("Evapotrans",         "decimal(4,1)"),                            # 18
    ("AnnualEvapTran",     "decimal(5,1)"),                            # 19
    ("ApparentTemp",       "decimal(4,1)"),                            # 20
    ("MaxSolarRad",        "decimal(5,1)"),                            # 21
    ("HrsSunShine",        "decimal(3,1)"),                            # 22
    ("CurrWindBearing",    "varchar(3)"),                              # 23
    ("RG11rain",           "decimal(4,1)"),                            # 24
    ("RainSinceMidnight",  "decimal(4,1)"),                            # 25
    ("FeelsLike",          "decimal(4,1)"),                            # 26
    ("Humidex",            "decimal(4,1)"),                            # 27
    ("BlackGlobeTemp",     "decimal(4,1)"),                            # 28
    ("WetBulbGlobeTemp",   "decimal(4,1)"),                            # 29
    ("WindbearingSym",     "varchar(3)"),                              # 30 (derived)
    ("CurrWindBearingSym", "varchar(3)"),                              # 31 (derived)
]

# ------------------------------------------------------------
# Date/time conversions
# ------------------------------------------------------------
def convert_uk_date(d):
    # dd/MM/yy -> yyyy-MM-dd
    return datetime.strptime(d, "%d/%m/%y").strftime("%Y-%m-%d")

def unix_to_mysql(ts):
    # Unix timestamp (seconds, UTC) -> yyyy-MM-dd HH:MM:SS
    ts = int(ts)
    dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# ------------------------------------------------------------
# Build INSERT SQL for dayfile
# ------------------------------------------------------------
def build_dayfile_insert_sql(table_name):
    colnames = [c[0] for c in DAYFILE_COLUMNS]
    cols = ", ".join(colnames)
    placeholders = ", ".join(["%s"] * len(colnames))
    return f"INSERT IGNORE INTO `{table_name}` ({cols}) VALUES ({placeholders})"

# ------------------------------------------------------------
# Build INSERT SQL for monthly
# ------------------------------------------------------------
def build_monthly_insert_sql(table_name):
    colnames = [c[0] for c in MONTHLY_COLUMNS]
    cols = ", ".join(colnames)
    placeholders = ", ".join(["%s"] * len(colnames))
    return f"INSERT IGNORE INTO `{table_name}` ({cols}) VALUES ({placeholders})"

# ------------------------------------------------------------
# Build CREATE TABLE SQL
# ------------------------------------------------------------
def build_create_table_sql(table_name, columns, primary_key):
    coldefs = []
    for name, definition in columns:
        coldefs.append(f"  `{name}` {definition}")

    # Add primary key at the end
    coldefs.append(f"  PRIMARY KEY (`{primary_key}`)")

    cols_sql = ",\n".join(coldefs)

    return (
        f"CREATE TABLE IF NOT EXISTS `{table_name}` (\n"
        f"{cols_sql}\n"
        f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    )

# ------------------------------------------------------------
# Check and create table if not exists
# ------------------------------------------------------------
def ensure_table_exists(cursor, table_name, mode):
    if mode == "dayfile":
        sql = build_create_table_sql(table_name, DAYFILE_COLUMNS, "LogDate")
    elif mode == "monthly":
        sql = build_create_table_sql(table_name, MONTHLY_COLUMNS, "LogDateTime")
    else:
        raise ValueError("Unknown mode for table creation")

    log(f"Ensuring table '{table_name}' exists")
    if not DRY_RUN:
        cursor.execute(sql)
    else:
        log(f"DRY RUN: would execute CREATE TABLE for '{table_name}'")
        print(sql)


# ------------------------------------------------------------
# Dayfile processor
# ------------------------------------------------------------
def process_dayfile(filepath, cursor, insert_sql):
    log(f"Processing DAYFILE: {filepath}")

    batch = []
    processed = 0
    inserted = 0

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            fields = line.split(",")

            # The file contains 55 fields; we add 2 derived fields
            expected_file_fields = len(DAYFILE_COLUMNS) - 2

            # Validate field count
            if len(fields) != expected_file_fields:
                log(f"Skipping line with wrong field count ({len(fields)}): {line}")
                continue

            # Convert dd/MM/yy → yyyy-MM-dd
            fields[0] = convert_uk_date(fields[0])

            # Extract the degree values
            hwg_bearing_deg = fields[2]       # HWindGBear
            dom_wind_dir_deg = fields[39]     # DomWindDir

            # Compute derived symbols
            hwg_symbol = degrees_to_compass_16(hwg_bearing_deg)
            dom_symbol = degrees_to_compass_16(dom_wind_dir_deg)

            # Append derived fields
            fields.append(hwg_symbol)
            fields.append(dom_symbol)

            batch.append(fields)
            processed += 1

            # Insert into database
            if len(batch) >= BATCH_SIZE:
                if not DRY_RUN:
                    cursor.executemany(insert_sql, batch)
                    inserted += cursor.rowcount
                batch.clear()

            if processed % PROGRESS_INTERVAL == 0:
                log(f"Processed {processed:,} rows so far")

    # flush remaining
    if batch and not DRY_RUN:
        cursor.executemany(insert_sql, batch)
        inserted += cursor.rowcount

    log(
        f"Finished DAYFILE: {processed:,} processed, "
        f"{inserted:,} {'simulated' if DRY_RUN else 'inserted'}"
    )

# ------------------------------------------------------------
# Monthly processor
# ------------------------------------------------------------
def process_monthly(filepath, cursor, insert_sql):
    log(f"Processing MONTHLY: {filepath}")

    batch = []
    processed = 0
    inserted = 0

    DATA_FIELDS = 27       # SQL fields after timestamp, before derived fields

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            fields = line.split(",")

            # Legacy monthly logs may have only 17 fields
            if len(fields) < 17:
                log(f"Skipping malformed line ({len(fields)} fields): {line}")
                continue

            # Build SQL row
            row = []

            # 1) LogDateTime from Unix timestamp (CSV[1])
            row.append(unix_to_mysql(fields[1]))

            # 2) Data fields from CSV[2..]
            data = fields[2:]

            # Pad missing fields with None
            if len(data) < DATA_FIELDS:
                data = data + [None] * (DATA_FIELDS - len(data))
            else:
                data = data[:DATA_FIELDS]

            row.extend(data)

            # 3) Derived fields
            # Windbearing = CSV[7] if present, else None
            wind_bearing = fields[7] if len(fields) > 7 else None
            curr_wind_bearing = fields[24] if len(fields) > 24 else None

            # Compute derived symbols
            wind_sym = degrees_to_compass_16(wind_bearing) if wind_bearing else None
            curr_wind_sym = degrees_to_compass_16(curr_wind_bearing) if curr_wind_bearing else None

            # Append derived fields
            row.append(wind_sym)
            row.append(curr_wind_sym)

            batch.append(row)

            processed += 1

            # 3 - Execute insert
            if len(batch) >= BATCH_SIZE:
                if not DRY_RUN:
                    cursor.executemany(insert_sql, batch)
                    inserted += cursor.rowcount
                batch.clear()

            if processed % PROGRESS_INTERVAL == 0:
                log(f"Processed {processed:,} rows so far")

    if batch and not DRY_RUN:
        cursor.executemany(insert_sql, batch)
        inserted += cursor.rowcount

    log(
        f"Finished MONTHLY: {processed:,} processed, "
        f"{inserted:,} {'simulated' if DRY_RUN else 'inserted'}"
    )


# ------------------------------------------------------------
# Mode dispatch
# ------------------------------------------------------------
VALID_MODES = {
    "dayfile": process_dayfile,
    "monthly": process_monthly,
}

DEFAULT_TABLE = {
    "dayfile": "Dayfile",
    "monthly": "Monthly",
}


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
def main():
    global DRY_RUN

    if len(sys.argv) < 3:
        print("Usage: python import_data.py <dayfile|monthly> [table_name] <file1> [file2 ...] [--dry-run]")
        sys.exit(1)

    mode = sys.argv[1].lower()
    if mode not in VALID_MODES:
        print("Invalid mode. Must be: dayfile or monthly - got: ", mode)
        sys.exit(1)

    if "--dry-run" in sys.argv:
        DRY_RUN = True
        sys.argv.remove("--dry-run")
        log("Dry run mode enabled — no database changes will be made")

    # Determine whether the second argument is a table name or a file
    possible_table = sys.argv[2]

    if os.path.isfile(possible_table):
        table_name = DEFAULT_TABLE[mode]
        filepaths = sys.argv[2:]
    else:
        table_name = possible_table
        filepaths = sys.argv[3:]

    if not filepaths:
        print("Error: No data files provided.")
        sys.exit(1)

    log(f"Starting import in mode: {mode}")

    handler = VALID_MODES[mode]

    db = connect_db()
    cursor = db.cursor()

    # Build insert SQL
    if mode == "dayfile":
        insert_sql = build_dayfile_insert_sql(table_name)
    else:
        insert_sql = build_monthly_insert_sql(table_name)

    # Ensure table exists (or simulate)
    ensure_table_exists(cursor, table_name, mode)

    if not DRY_RUN:
        db.commit()
        log(f"Table '{table_name}' is ready.")
    else:
        log(f"DRY RUN: table '{table_name}' preparation simulated (no changes committed).")


    try:
        for filepath in filepaths:
            if not os.path.isfile(filepath):
                log(f"Skipping missing file: {filepath}")
                continue

            handler(filepath, cursor, insert_sql)

        if DRY_RUN:
            log(f"DRY RUN COMPLETE — {mode.upper()} import simulated for table '{table_name}'.")
        else:
            db.commit()
            log(f"Import complete into table '{table_name}'.")
    except Exception as e:
        if not DRY_RUN:
            db.rollback()
        log(f"Error: {e}")
    finally:
        cursor.close()
        db.close()


if __name__ == "__main__":
    main()
