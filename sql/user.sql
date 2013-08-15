DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(25) NOT NULL DEFAULT '',
  `lastName` varchar(25) NOT NULL DEFAULT '',
  `password` varchar(20) NOT NULL DEFAULT '',
  `username` varchar(20) NOT NULL DEFAULT '',
  `email` varchar(50) NOT NULL DEFAULT '',
  `phone` varchar(12) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `user` (`id`, `firstName`, `lastName`, `password`, `username`, `email`, `phone`)
VALUES
  (2,'John','Doe','123','thedoezer','thedoezer@hotmail.com','801-123-4567'),
  (3,'Jane','Doe','123','jdoe','jdoe@gmail.com','801-111-2222');