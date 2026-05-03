-- Amend the table names if you use non-default names

ALTER TABLE Monthly
ADD COLUMN IF NOT EXISTS BlackGlobeTemp decimal(4,1) NULL,
ADD COLUMN IF NOT EXISTS WetBulbGlobeTemp decimal(4,1) NULL;

ALTER TABLE Dayfile
ADD COLUMN IF NOT EXISTS HighBgt decimal(5,1) NULL,
ADD COLUMN IF NOT EXISTS THighBgt varchar(5) NULL,
ADD COLUMN IF NOT EXISTS HighWbgt decimal(5,1) NULL,
ADD COLUMN IF NOT EXISTS THighWbgt varchar(5) NULL;
