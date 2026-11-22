USE mysociety_db;
SELECT DATABASE() AS Current_Database;
SHOW TABLES;
SHOW FULL TABLES
WHERE Table_type = 'VIEW';
SHOW PROCEDURE STATUS
WHERE Db = 'mysociety_db';
SELECT * FROM resident;