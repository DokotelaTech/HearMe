<?php

/* Database host */
$host = "localhost";

/* Database name */
$db = "hearme_db";

/* MySQL username */
$user = "root";

/* MySQL password */
$pass = "";

/* Character set */
$charset = "utf8mb4";


/* Build connection string */
$dsn =
"mysql:host=$host;dbname=$db;charset=$charset";


/* PDO settings */
$options = [

PDO::ATTR_ERRMODE =>
PDO::ERRMODE_EXCEPTION,

PDO::ATTR_DEFAULT_FETCH_MODE =>
PDO::FETCH_ASSOC,

PDO::ATTR_EMULATE_PREPARES =>
false

];


/* Create database connection */
$pdo = new PDO(
$dsn,
$user,
$pass,
$options
);

?>