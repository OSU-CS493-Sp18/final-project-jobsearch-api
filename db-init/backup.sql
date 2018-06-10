-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: JobSearch
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
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `glassdoorRating` float NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `sizeCategory` varchar(20) NOT NULL,
  `hqCity` varchar(20) NOT NULL,
  `hqState` varchar(2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Intel','An American multinational corporation and technology company.',3.8,'intel.com','10000+','Santa Clara','CA'),(2,'Amazon','An American electronic commerce and cloud computing company.',3.8,'amazon.com','10000+','Seattle','WA'),(3,'IBM','An American multinational technology company.',3.6,'ibm.com','10000+','Armonk','NY'),(4,'Apple','An American technology company headquartered that designs, develops, and sells consumer electronics, computer software, and online services.',4,'apple.com','10000+','Cupertino','CA'),(5,'Realtor.com','A real estate listings website.',3.7,'realtor.com','1001-5000','Santa Clara','CA');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fields`
--

DROP TABLE IF EXISTS `fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fields` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fieldName` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `averageSalary` int(11) NOT NULL,
  `lowSalary` int(11) NOT NULL,
  `highSalary` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fields`
--

LOCK TABLES `fields` WRITE;
/*!40000 ALTER TABLE `fields` DISABLE KEYS */;
INSERT INTO `fields` VALUES (1,'Data Science','An interdisciplinary field of scientific methods, processes, algorithms and systems to extract knowledge or insights from data in various forms',120000,87000,158000),(2,'Software Test Engineering','Test the product or system to ensure it functions properly and meets the business needs',82000,62000,112000),(3,'Frontend Development','Writes HTML, CSS, and JavaScript and knows the various APIs that browsers expose',89000,61000,118000),(4,'Backend Development','Code written by back end developers is what communicates the database information to the browser',70000,42000,97000);
/*!40000 ALTER TABLE `fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `positionName` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `requirements` varchar(255) DEFAULT NULL,
  `posted_date` date NOT NULL,
  `city` varchar(20) NOT NULL,
  `state` varchar(2) NOT NULL,
  `salary` int(11) DEFAULT NULL,
  `denied` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'Data Scientist, Entry Level (Intel)','In this role, you may assist business units with casual inferences and observations with finding patterns, relationships in data, develop software, algorithms and applications to apply mathematics to data.','Degree in Computer Science, machine learning and statistical approaches, and experience applying them, program languages such as Python, Perl, Java, and/or C++','2018-04-20','Hillsboro','OR',NULL,0),(2,'Data Analyst','Data Analyst is responsible for all aspects of the reporting systems and tools used to facilitate data-driven decision making across Multnomah Athletic Clubs governance, leadership and operational teams.','Bachelors Degree in Information Management, Computer Science or related field, Strong customer service skills., Related experience designing and developing data warehouse solutions, SQL database design and Microsoft SQL server.','2018-04-17','Portland','OR',NULL,0);
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-10 20:10:41
