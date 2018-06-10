-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: businesses
-- ------------------------------------------------------
-- Server version	5.7.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesses` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` char(2) NOT NULL,
  `zip` char(5) NOT NULL,
  `phone` char(12) NOT NULL,
  `category` varchar(255) NOT NULL,
  `subcategory` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `ownerid` char(24) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ownerid` (`ownerid`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (1,'Block 15','300 SW Jefferson Ave.','Corvallis','OR','97333','541-758-2077','Restaurant','Brewpub','http://block15.com',NULL,'16'),(2,'Robnett\'s Hardware','400 SW 2nd St.','Corvallis','OR','97333','541-753-5531','Shopping','Hardware',NULL,NULL,'2'),(3,'Corvallis Brewing Supply','119 SW 4th St.','Corvallis','OR','97333','541-758-1674','Shopping','Brewing Supply','http://www.lickspigot.com',NULL,'1'),(4,'First Alternative Co-op North Store','2855 NW Grant Ave.','Corvallis','OR','97330','541-452-3115','Shopping','Groceries',NULL,NULL,'3'),(5,'Local Boyz','1425 NW Monroe Ave.','Corvallis','OR','97330','541-754-5338','Restaurant','Hawaiian',NULL,NULL,'8'),(6,'Interzone','1563 NW Monroe Ave.','Corvallis','OR','97330','541-754-5965','Restaurant','Coffee Shop',NULL,NULL,'6'),(7,'Darkside Cinema','215 SW 4th St.','Corvallis','OR','97333','541-752-4161','Entertainment','Movie Theater','http://darksidecinema.com',NULL,'9'),(8,'The Beanery Downtown','500 SW 2nd St.','Corvallis','OR','97333','541-753-7442','Restaurant','Coffee Shop',NULL,NULL,'7'),(9,'WinCo Foods','2335 NW Kings Blvd.','Corvallis','OR','97330','541-753-7002','Shopping','Groceries',NULL,NULL,'4'),(10,'The Book Bin','215 SW 4th St.','Corvallis','OR','97333','541-752-0040','Shopping','Book Store',NULL,NULL,'10'),(11,'Fred Meyer','777 NW Kings Blvd.','Corvallis','OR','97330','541-753-9116','Shopping','Groceries',NULL,NULL,'5'),(12,'Cyclotopia','435 SW 2nd St.','Corvallis','OR','97333','541-757-9694','Shopping','Bicycle Shop',NULL,NULL,'11'),(13,'Oregon Coffee & Tea','215 NW Monroe Ave.','Corvallis','OR','97333','541-752-2421','Shopping','Tea House','http://www.oregoncoffeeandtea.com',NULL,'13'),(14,'Corvallis Cyclery','344 SW 2nd St.','Corvallis','OR','97333','541-752-5952','Shopping','Bicycle Shop',NULL,NULL,'12'),(15,'Spaeth Lumber','1585 NW 9th St.','Corvallis','OR','97330','541-752-1930','Shopping','Hardware',NULL,NULL,'14'),(16,'New Morning Bakery','219 SW 2nd St.','Corvallis','OR','97333','541-754-0181','Restaurant','Bakery',NULL,NULL,'15'),(17,'First Alternative Co-op South Store','1007 SE 3rd St.','Corvallis','OR','97333','541-753-3115','Shopping','Groceries',NULL,NULL,'3'),(18,'Block 15 Brewery & Tap Room','3415 SW Deschutes St.','Corvallis','OR','97333','541-752-2337','Restaurant','Brewpub','http://block15.com',NULL,'16'),(19,'The Beanery Monroe','2541 NW Monroe Ave.','Corvallis','OR','97330','541-757-0828','Restaurant','Coffee Shop',NULL,NULL,'7');
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photos` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `caption` text,
  `data` longblob NOT NULL,
  `userid` char(24) NOT NULL,
  `businessid` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_userid` (`userid`),
  KEY `idx_businessid` (`businessid`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`businessid`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,NULL,'010010101110101010110','21',15),(2,NULL,'010010101110101010110','20',2),(3,'Hops','010010101110101010110','26',3),(4,'Sticky Hands','010010101110101010110','28',18),(5,NULL,'010010101110101010110','25',2),(6,'Popcorn!','010010101110101010110','21',7),(7,'This is my dinner.','010010101110101010110','7',5),(8,'Big fermentor','010010101110101010110','25',18),(9,'Cake!','010010101110101010110','6',16),(10,NULL,'010010101110101010110','26',5);
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `dollars` tinyint(4) NOT NULL,
  `stars` float NOT NULL,
  `review` text,
  `userid` char(24) NOT NULL,
  `businessid` mediumint(9) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_userid` (`userid`),
  KEY `idx_businessid` (`businessid`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`businessid`) REFERENCES `businesses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,4.5,'Cheap, delicious food.','7',5),(2,2,4,NULL,'21',15),(3,2,5,'Try the hazlenut torte.  It\'s the best!','6',16),(4,1,5,'Joel, the owner, is super friendly and helpful.','26',3),(5,1,5,'A Corvallis gem.','21',7),(6,1,5,'Yummmmmmm!','26',5),(7,2,4,NULL,'20',2),(8,1,4,'How many fasteners can one room hold?','25',2),(9,1,4,'Good beer, good food, though limited selection.','28',18),(10,2,4.5,NULL,'25',18);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-16  6:47:05
