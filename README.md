angular-php-demo
================

client/ - contains angular, less, etc. source files - a grunt task builds everything and stores it in the target

server-php/ - contains php files necessary to run server

sql/ - script to create table(s) and populate with sample data

To run:

1. ./server-php/php composer install
2. Update mysql connection settings in index.php
3. Run sql script
4. View index.php in your browser

NOTE: index.php and the angular app assume they will be served from the web root. All css/js is already built so there is no need to run grunt unless you make changes.
