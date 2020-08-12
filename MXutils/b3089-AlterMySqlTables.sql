ALTER TABLE Dayfile
ADD MaxHumidex decimal(5,1),
ADD TMaxHumidex varchar(5);

ALTER TABLE Monthly
ADD Humidex decimal(4,1);
