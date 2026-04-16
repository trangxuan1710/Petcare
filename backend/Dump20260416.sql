-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: petical
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '19cf7fc4-2c07-11f1-a9c8-0242ac110002:1-2266';

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbt1ji0od8t2mhp0thot6pod8u` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'Nguyễn Văn Đức','0999666888');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FKisrj7dti092bxya7p8jt7acs7` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1),(2),(3),(4),(5);
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_form`
--

DROP TABLE IF EXISTS `exam_form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_form` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_type` varchar(255) NOT NULL,
  `is_emergency` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_form`
--

LOCK TABLES `exam_form` WRITE;
/*!40000 ALTER TABLE `exam_form` DISABLE KEYS */;
INSERT INTO `exam_form` VALUES (1,'khám mới',_binary '\0');
/*!40000 ALTER TABLE `exam_form` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_result`
--

DROP TABLE IF EXISTS `exam_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_result` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conclusion` text,
  `end_time` datetime(6) DEFAULT NULL,
  `evidence_path` text,
  `start_time` datetime(6) DEFAULT NULL,
  `medical_record_id` bigint NOT NULL,
  `treatment_direction_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKofr05cs6ytmoggpu6dnmkf2al` (`medical_record_id`),
  KEY `FKrxswaqe0voedt341h1998prlt` (`treatment_direction_id`),
  CONSTRAINT `FKofr05cs6ytmoggpu6dnmkf2al` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKrxswaqe0voedt341h1998prlt` FOREIGN KEY (`treatment_direction_id`) REFERENCES `treatment_direction` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_result`
--

LOCK TABLES `exam_result` WRITE;
/*!40000 ALTER TABLE `exam_result` DISABLE KEYS */;
INSERT INTO `exam_result` VALUES (1,'bị đầy bụng ',NULL,'./storage/exam-results/exam-result-1776339667821-734bcb41-a54b-4ea2-b14c-315e64575471.jpg;./storage/exam-results/exam-result-1776339667823-2a901a49-749f-4b8a-90e6-85e1c9251905.jpg','2026-04-16 18:41:07.820756',1,4);
/*!40000 ALTER TABLE `exam_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_status`
--

DROP TABLE IF EXISTS `exam_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_status`
--

LOCK TABLES `exam_status` WRITE;
/*!40000 ALTER TABLE `exam_status` DISABLE KEYS */;
INSERT INTO `exam_status` VALUES (1,'PENDING'),(2,'IN_PROGRESS'),(3,'COMPLETED');
/*!40000 ALTER TABLE `exam_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `medical_record_id` bigint NOT NULL,
  `payment_method_id` bigint NOT NULL,
  `receptionist_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKag2wjmbtylxouuuxt30fnpmjf` (`medical_record_id`),
  KEY `FKrgxmd0sscce0tgfckpcoydrwl` (`payment_method_id`),
  KEY `FK9r4w2t4od6t5axyu7up90y4nl` (`receptionist_id`),
  CONSTRAINT `FK9r4w2t4od6t5axyu7up90y4nl` FOREIGN KEY (`receptionist_id`) REFERENCES `receptionist` (`id`),
  CONSTRAINT `FK9vk4grlg5i2tt7u3ecrl5dmhd` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKrgxmd0sscce0tgfckpcoydrwl` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_record`
--

DROP TABLE IF EXISTS `medical_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_date` datetime(6) DEFAULT NULL,
  `doctor_id` bigint NOT NULL,
  `reception_record_id` bigint NOT NULL,
  `status_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmommgymv6rayvbje0hp4c6g8w` (`doctor_id`),
  KEY `FK898mi6c02r4s7fxp8awgqsfe0` (`reception_record_id`),
  KEY `FKot1sme9bya0po3g6fdoexfkdj` (`status_id`),
  CONSTRAINT `FK898mi6c02r4s7fxp8awgqsfe0` FOREIGN KEY (`reception_record_id`) REFERENCES `reception_record` (`id`),
  CONSTRAINT `FKmommgymv6rayvbje0hp4c6g8w` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `FKot1sme9bya0po3g6fdoexfkdj` FOREIGN KEY (`status_id`) REFERENCES `exam_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_record`
--

LOCK TABLES `medical_record` WRITE;
/*!40000 ALTER TABLE `medical_record` DISABLE KEYS */;
INSERT INTO `medical_record` VALUES (1,'2026-04-16 18:32:21.750457',1,1,2);
/*!40000 ALTER TABLE `medical_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(255) NOT NULL,
  `stock_quantity` int NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `quantity_per_box` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=431 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES (1,'Hộp 4 vỉ * 10 viên\n1 viên Amoxicillin 125 mg','Amentyl (cao cấp)',100,'THUOC','Viên',30000.00,40),(2,'Chai 20ml','Amox - Clav (thông dụng)',101,'THUOC','Lọ',80000.00,1),(3,'Hộp 6 lọ * 5ml','Clamoxcin (cao cấp)',102,'THUOC','Lọ',170000.00,6),(4,'Hộp 5 cặp','Cefquino DC',103,'THUOC','Lọ',100000.00,5),(5,'Lọ 10ml','Thuốc nhỏ mắt Bio-Gentadrop',104,'THUOC','Lọ',15000.00,1),(6,'Hộp 4 vỉ * 10 viên','Tiaflox 200mg (>2,5kg - 5kg)',105,'THUOC','Viên',50000.00,40),(7,'Lọ 20ml','Enrofloxacin 10%',106,'THUOC','Lọ',70000.00,1),(8,'Vỉ 10 viên','Enroko 50mg',107,'THUOC','Viên',8000.00,10),(9,'Hộp 6 lọ * 5ml','Fluroquin 5ml',108,'THUOC','Lọ',140000.00,6),(10,'Hộp 4 vỉ * 10 viên','Marbo 250mg (>5kg - 10kg) (cao cấp)',109,'THUOC','Viên',22000.00,40),(11,'Hộp 6 lọ * 5ml','Marbo 5 (cao cấp)',110,'THUOC','Lọ',160000.00,6),(12,'Hộp 5 viên','PrimoPrado',111,'THUOC','Viên',52000.00,5),(13,'Hộp 6 lọ * 5ml','Doxyciline LA',112,'THUOC','Lọ',150000.00,6),(14,'Hộp 4 vỉ * 10 viên','Doxycilin Tablet 6 - 500mg (>6,5kg - 10,5kg)',113,'THUOC','Viên',46000.00,40),(15,'Hộp 5 vỉ * 8 viên','Doxycycline - 1g (>17,1kg - 21kg)',114,'THUOC','Viên',260000.00,40),(16,'Hộp 5 vỉ * 8 viên','Doxycycline Base 800mg (>10kg - 20kg)',115,'THUOC','Viên',52000.00,40),(17,'Hộp 2 vỉ * 10 viên','O.T.C ',116,'THUOC','Viên',5000.00,20),(18,'Vỉ 6 viên','Goclin 150mg',117,'THUOC','Viên',15000.00,6),(19,'Chai 50 ml','Aziflunixin (cao cấp)',118,'THUOC','Ml',10000.00,1),(20,'Hộp 4 vỉ * 10 viên','Halquino 2 (cao cấp)',119,'THUOC','Viên',27000.00,40),(21,'Hộp 6 lọ * 5ml','Zutidyl XL ',120,'THUOC','Lọ',170000.00,6),(22,'Chai 20ml','Tulavet ',121,'THUOC','Lọ',520000.00,1),(23,'Hộp 10 viên. \n1 viên Amoxicillin 200 mg','Clamox tab (thông dụng)',122,'THUOC','Viên',7000.00,10),(24,'Hộp 12 lọ. \n1 lọ 15ml/750mg','Clavamox Drops (cao cấp)',123,'THUOC','Lọ',180000.00,12),(25,'Lọ 20ml/3g','Pet Amox Plus (thông dụng)',124,'THUOC','Lọ',60000.00,1),(26,'Lọ 1.2g','Axuka',125,'THUOC','Lọ',80000.00,1),(27,'Hộp 10 lọ x 1 lọ/1g','Viciamox',126,'THUOC','Lọ',50000.00,10),(28,'1 lọ/1g','Unasyn Pfizer 1.5g (cao cấp)',127,'THUOC','Lọ',130000.00,1),(29,'Hộp 50 lọ * 1 lọ/1g\n','Ama Power 1.5g (thông dụng)',128,'THUOC','Lọ',80000.00,50),(30,'1 lọ/1g','Ampicillin',129,'THUOC','Lọ',20000.00,1),(31,'Hộp 7 vỉ x 7 viên','Lixen Tablets',130,'THUOC','Viên',14000.00,49),(32,'Hộp 1 lọ','Ceptrisul 824mg',131,'THUOC','Lọ',100000.00,1),(33,'Hộp 1 lọ: 1 lọ/1g','Rocephin (cao cấp)',132,'THUOC','Lọ',350000.00,1),(34,'Hộp 10 lọ: 1 lọ/1g','Trikaxon - Ceftriaxon1g (thông dụng)',133,'THUOC','Lọ',30000.00,10),(35,'Hộp 1 lọ: 1 lọ/20ml','Ceptifi (thông dụng)',134,'THUOC','Lọ',65000.00,1),(36,'Hộp 1 lọ','Ceptifi 55mg (cao cấp)',135,'THUOC','Lọ',110000.00,1),(37,'Tuýp 20g','Genazol ',136,'THUOC','Ống',55000.00,1),(38,'Chai 20ml','Genta-Tylo',137,'THUOC','Lọ',70000.00,1),(39,'Hộp 10 viên','Enro plus 50mg',138,'THUOC','Viên',15000.00,10),(40,'Hộp 10 vỉ * 10 viên','Enrocin Tab 50mg',139,'THUOC','Viên',5000.00,100),(41,'Chai 20ml','Melovet (thông dụng)',140,'THUOC','Lọ',25000.00,1),(42,'Hộp 10 viên','Previcox 57mg',141,'THUOC','Viên',28000.00,10),(43,'Chai 50 ml','Flunixin ',142,'THUOC','Ml',10000.00,1),(44,'Chai 100 ml','Dipyzin ',143,'THUOC','Ml',10000.00,1),(45,'Hộp 2 vỉ * 10 viên','Inflamine ',144,'THUOC','Viên',5000.00,20),(46,'Hộp 2 vỉ * 10 viên','Dosone',145,'THUOC','Viên',5000.00,20),(47,'Chai 100 ml','Dexmin ',146,'THUOC','Ml',10000.00,1),(48,'Chai 20ml','Flucort ',147,'THUOC','Lọ',40000.00,1),(49,'Hộp 6 lọ * 5ml','Chymosin XL ',148,'THUOC','Lọ',200000.00,6),(50,'Vỉ 10 viên','Tofamate Tab 6',149,'THUOC','Viên',15000.00,10),(51,'Hộp 2 ống 2ml','Ketovet 2ml (cao cấp)',150,'THUOC','Ống',82000.00,2),(52,'Chai 20ml','Ketovet 5% (thông dụng)',151,'THUOC','Chai',60000.00,1),(53,'Hộp 10 Vỉ * 10 viên','Inflacam 2.5 mg (cao cấp)',152,'THUOC','Viên',17000.00,1),(54,'Chai 20ml','Loxic oral for pet (thông dụng)',153,'THUOC','Ml',15000.00,1),(55,'Hộp 1 ống 2ml (hộp 2 ống mới đúng)','Loxic for dog (cao cấp)',154,'THUOC','Ống',90000.00,1),(56,'Chai 20ml','T-F-A ',155,'THUOC','Lọ',70000.00,1),(57,'Vỉ 10 viên','Tofamate Tab 6',156,'THUOC','Viên',15000.00,10),(58,'Chai 20ml','Chlorphemin ',157,'THUOC','Lọ',20000.00,1),(59,'Chai 20ml','Preso ',158,'THUOC','Lọ',22000.00,1),(60,'Ống 1ml','Methylprednisolone 40mg',159,'THUOC','Ống',100000.00,1),(61,'Vỉ 10 viên','Medlon 4mg',160,'THUOC','Viên',5000.00,10),(62,'Chai 20ml','Dexa',161,'THUOC','Lọ',25000.00,1),(63,'Hộp 20 vỉ x 30 viên','Dexamethason',162,'THUOC','Viên',5000.00,600),(64,'Lọ 100 viên','Cetasone',163,'THUOC','Viên',5000.00,100),(65,'Hộp 2 vỉ * 10 viên','Alphachymotrypsin',164,'THUOC','Viên',5000.00,20),(66,'Chai 20ml','Chymosin fort 20ml (thông dụng)',165,'THUOC','Lọ',30000.00,1),(67,'Hộp 1 ống 5ml','Chymosin fort 5ml (cao cấp)',166,'THUOC','Lọ',200000.00,1),(68,'Chai 500ml','AA - Vicom ',167,'THUOC','Lọ',70000.00,1),(69,'Chai 500ml','Dịch truyền Natri Clorid 0,9% ',168,'THUOC','Lọ',20000.00,1),(70,'Chai 500ml','Dịch truyền Ringer Lactate',169,'THUOC','Lọ',20000.00,1),(71,'Chai 500ml','Dịch truyền Glucose 5% ',170,'THUOC','Lọ',20000.00,1),(72,'Chai 500 ml','Vime Lyte IV ',171,'THUOC','Lọ',150000.00,1),(73,'Chai 25 ml','Xyl M2 ',172,'THUOC','Ml',60000.00,1),(74,'Chai 20 ml','Vime Lazin ',173,'THUOC','Ml',40000.00,1),(75,'Chai 5 ml','Zoletil 50',174,'THUOC','Ml',300000.00,1),(76,'Lọ 20ml','Troypofol ',175,'THUOC','Ml',100000.00,1),(77,'Chai 250ml','Isofurane',176,'THUOC','Ml',200000.00,1),(78,'Chai 250ml','Sevofurane',177,'THUOC','Ml',200000.00,1),(79,'Lọ 20 ml','Lidocain 20ml (dạng xịt)',178,'THUOC','Lọ',400000.00,1),(80,'Chai 5ml','Lidocain 5ml (dạng tiêm)',179,'THUOC','Ml',50000.00,1),(81,'Chai 20ml','Prozil fort ',180,'THUOC','Ml',50000.00,1),(82,'Tuýp 10g','Ear sol ',181,'THUOC','Tuýp',150000.00,1),(83,'Tuýp 10g','Itanomyl ',182,'THUOC','Tuýp',190000.00,1),(84,'Tuýp 10g','Itanomyl ',183,'THUOC','Tuýp',190000.00,1),(85,'Chai 10ml','Nhỏ tai cho chó Easotic (Cao cấp)',184,'THUOC','Lọ',280000.00,1),(86,'Lọ 100ml','Anagil - C ',185,'THUOC','Ml',10000.00,1),(87,'Hộp 10 ống x 1ml','Adrenalin',186,'THUOC','Ống',10000.00,10),(88,'Lọ 30 viên','Joints & Mobility ',187,'THUOC','Viên',15000.00,30),(89,'Lọ 60 viên','ArthoVet ',188,'THUOC','Viên',25000.00,60),(90,'Hộp 100 Viên','Dr. Petz Osteoflex',189,'THUOC','Viên',20000.00,100),(91,'Hộp 30 viên','Movoflex size S',190,'THUOC','Viên',33000.00,30),(92,'Hộp 30 viên','Movoflex size M',191,'THUOC','Viên',45000.00,30),(93,'Tuýp 20g','Derma herbal chó',192,'THUOC','Tuýp',150000.00,1),(94,'Tuýp 20g','Derma herbal mèo',193,'THUOC','Tuýp',180000.00,1),(95,'Tuýp 20g','Iodine 20g',194,'THUOC','Tuýp',50000.00,1),(96,'Hộp 2 tuýp 10g','Masti-Cozym',195,'THUOC','Tuýp',170000.00,2),(97,'Hộp 4 vỉ * 10 viên','Pet Gold 300mg (>2.5kg - 5kg)',196,'THUOC','Viên',22000.00,40),(98,'Tuýp 20g','S\' Derm care 20g',197,'THUOC','Tuýp',70000.00,1),(99,'Lọ 60 viên','Vettoskin ',198,'THUOC','Viên',15000.00,60),(100,'Hộp 100 Viên','Dr. Petz Oderm',199,'THUOC','Viên',20000.00,100),(101,'Chai 30 ml','Itra sol mèo 15mg',200,'THUOC','Lọ',200000.00,1),(102,'Hộp 30 viên','Itra tab mèo 25mg',201,'THUOC','Viên',10000.00,1),(103,'Hộp 30 viên','Itra tab chó 100mg ',202,'THUOC','Viên',18000.00,1),(104,'Hộp 30 viên','Itra tab chó 25mg ',203,'THUOC','Viên',10000.00,1),(105,'Chai 5 ml','Flucasol (cao cấp)',204,'THUOC','Lọ',300000.00,1),(106,'Lọ 50ml','Fungikur Alkin',205,'THUOC','Lọ',130000.00,1),(107,'Lọ 50ml','Mitecyn Alkin',206,'THUOC','Lọ',100000.00,1),(108,'Chai 100 ml','Sữa Tắm Dermcare Malaseb (Cao cấp)',207,'THUOC','Lọ',220000.00,1),(109,'Chai 200ml- Yêu cầu bán chai chiết 100ml','Dầu tắm Prunus Shampoo Micochlodine (Cao cấp)',208,'THUOC','Lọ',450000.00,1),(110,'Tuýp 15g','Thuốc nấm và viêm da Ketoconazol',209,'THUOC','Tuýp',170000.00,1),(111,'Chai 100ml','Biopirox ',210,'THUOC','Chai',300000.00,1),(112,'Hộp 200 viên','Ketoconazole Tablet',211,'THUOC','Viên',10000.00,200),(113,'Tuýp 100g','Advance Keto 100g',212,'THUOC','Tuýp',280000.00,1),(114,'Tuýp 25g','Advance Keto 25g',213,'THUOC','Tuýp',70000.00,1),(115,'Lọ 20ml','Marbovitryl (thông dụng)',214,'THUOC','Lọ',60000.00,1),(116,'Chai 10 ml','Thuốc nhỏ tai Vemedim',215,'THUOC','Lọ',50000.00,1),(117,'Hộp 20 ống x 250mg/ống','Vibravet 100 Paster For Cats And Dogs (cao cấp)',216,'THUOC','Ống',280000.00,20),(118,'Hộp 10 viên * 50mg','Respicure 50mg',217,'THUOC','Viên',5000.00,10),(119,'Lọ 60 viên * 100mg','Respicure 100mg',218,'THUOC','Viên',7000.00,60),(120,'Tuýp 10ml','Respicure 5% ',219,'THUOC','Tuýp',180000.00,1),(121,'Tuýp 5gr','Terramycin',220,'THUOC','Tuýp',100000.00,1),(122,'Lọ 20ml','Avimecin 20ml (thông dụng)',221,'THUOC','Lọ',52000.00,1),(123,'Hộp 2 ống 2ml','Avimecin 2ml (cao cấp)',222,'THUOC','Ống',60000.00,2),(124,'Hộp 1 lọ 20ml','Azisol Oral',223,'THUOC','Lọ',60000.00,1),(125,'Chai 10ml','Lincocin 5%',224,'THUOC','Lọ',130000.00,1),(126,'Chai 10ml','Linspec',225,'THUOC','Lọ',30000.00,1),(127,'Hộp 10 viên','Lincospectina ',226,'THUOC','Viên',5000.00,10),(128,'Chai 10ml','Vimelinspec',227,'THUOC','Lọ',30000.00,1),(129,'Chai 20ml','Tylovet ',228,'THUOC','Lọ',60000.00,1),(130,'Hộp 1 ống 1ml','Tulavitryl',229,'THUOC','Ống',90000.00,1),(131,'Chai 10ml','Spectylo',230,'THUOC','Chai',25000.00,1),(132,'Chai 100ml','Metronidazol 100ml (chai truyền)',231,'THUOC','Chai',50000.00,1),(133,'Hộp 50 vỉ x 10 viên/vỉ','Metronidazole 250mg',232,'THUOC','Viên',5000.00,500),(134,'Lọ 5ml','Thuốc nhỏ mắt Collydexa ',233,'THUOC','Lọ',15000.00,1),(135,'Tuýp 40g','Anti - Derm 40mg',234,'THUOC','Tuýp',70000.00,1),(136,'Lọ 100 viên','Apoquel 16mg',235,'THUOC','Viên',100000.00,100),(137,'Lọ 100 viên','Apoquel 3,6mg',236,'THUOC','Viên',40000.00,100),(138,'Lọ 100 viên','Apoquel 5,4mg',237,'THUOC','Viên',60000.00,100),(139,'Tuýp 20g','Levigatus 2g',238,'THUOC','Tuýp',40000.00,1),(140,'Hộp 28 gói','Megaderm <10kg',239,'THUOC','Gói',15000.00,28),(141,'Chai 30 ml','Flucozol (thông dụng)',240,'THUOC','Lọ',90000.00,1),(142,'Tuýp 10g','Terbinafin Cream 1%',241,'THUOC','Tuýp',35000.00,1),(143,'Hộp 2 vỉ x 10 viên','Griseofulvin 500mg',242,'THUOC','Viên',5000.00,20),(144,'Chai 100 ml','Micona spray',243,'THUOC','Chai',100000.00,1),(145,'Hộp 200 viên','Ketoconazole Tablet',244,'THUOC','Viên',10000.00,200),(146,'Tuýp 100g','Advance Keto 100g',245,'THUOC','Tuýp',280000.00,1),(147,'Tuýp 25g','Advance Keto 25g',246,'THUOC','Tuýp',70000.00,1),(148,'Chai 50 ml','Bhexin (cao cấp)',247,'THUOC','Ml',10000.00,1),(149,'Hộp 6 lọ * 5ml','Hen.Inj',248,'THUOC','Lọ',100000.00,6),(150,'Lọ 10ml','Vetussin',249,'THUOC','Lọ',60000.00,1),(151,'Chai 100 ml','Bromhexine (thông dụng)',250,'THUOC','Ml',10000.00,1),(152,'Hộp 10 ống 5ml','Bromhexine oral Chó',251,'THUOC','Ống',10000.00,10),(153,'Hộp 10 ống 3ml','Bromhexine oral Mèo',252,'THUOC','Ống',10000.00,10),(154,'Hộp 6 vỉ x 5 ống x 2.5ml','Ventolin khí dung',253,'THUOC','Ống',20000.00,30),(155,'Lọ A: 100ml\nLọ B: 10 ml','Seasal drop 100ml + Nano drop 10ml',254,'THUOC','Lọ',100000.00,1),(156,'Hộp 4 vỉ * 10 viên','Pet One 500mg (5kg - 10kg)',255,'THUOC','Viên',25000.00,40),(157,'Hộp 4 vỉ * 10 viên','Pet Vital 600mg (5kg - 10kg)',256,'THUOC','Viên',26000.00,40),(158,'Lọ 60 viên','Hemovet',257,'THUOC','Viên',10000.00,60),(159,'Hộp 30 viên','Immune System',258,'THUOC','Viên',25000.00,30),(160,'Hộp 20 lọ x 3ml/ lọ','Kháng thể HV',259,'THUOC','Lọ',100000.00,20),(161,'Lọ 5 ml – 10 ml','Thuốc FIP Heal',260,'THUOC','Lọ',1500000.00,1),(162,'Hộp 60 viên','Vetomune',261,'THUOC','Viên',20000.00,60),(163,'Chai 250ml','Cardiodol',262,'THUOC','Lọ',1500000.00,1),(164,'Lọ 1ml','Grafeel',263,'THUOC','Lọ',600000.00,1),(165,'Chai 100 ml','Na-campho',264,'THUOC','Ml',10000.00,1),(166,'Lọ 1ml','Nanokine',265,'THUOC','Lọ',380000.00,1),(167,'Hộp 10 viên','GS441524',266,'THUOC','Viên',130000.00,10),(168,'Lọ 45 viên','ViewVet',267,'THUOC','Viên',30000.00,45),(169,'Lọ 10ml','Alkin Omnix',268,'THUOC','Lọ',130000.00,1),(170,'Lọ 10ml','Bio-Gentadrop',269,'THUOC','Lọ',20000.00,1),(171,'Lọ 5 ml','Kary Uni',270,'THUOC','Lọ',90000.00,1),(172,'Lọ 5ml','Tobrex ',271,'THUOC','Lọ',65000.00,1),(173,'Lọ 10ml','Genta 30',272,'THUOC','Lọ',40000.00,1),(174,'Hộp 10 chai 10ml','Oxytocin ',273,'THUOC','Lọ',25000.00,1),(175,'Lọ 60 viên','SemeVet',274,'THUOC','Viên',20000.00,60),(176,'Hộp 3 vỉ * 10 viên/vỉ','Prolactino',275,'THUOC','Viên',30000.00,30),(177,'Chai 6ml','Progesterone ',276,'THUOC','Lọ',30000.00,1),(178,'Chai 120ml','Dung dịch Dr.Healmedix Otix-qure (Thông dụng)',277,'THUOC','Lọ',1200000.00,1),(179,'Tuýp 20gr','Alkin Otoklen',278,'THUOC','Lọ',140000.00,1),(180,'Lọ 120ml','Epiotic SIS Ear Cleanser for Dogs',279,'THUOC','Lọ',360000.00,1),(181,'Hộp 100 viên','Dr. Petz Nephrogard',280,'THUOC','Viên',15000.00,100),(182,'Hộp 12 viên','Kidney shield Chó ',281,'THUOC','Viên',7000.00,1),(183,'Hộp 12 viên','Kidney shield Mèo ',282,'THUOC','Viên',7000.00,1),(184,'Lọ 60 viên ','LespeDol',283,'THUOC','Viên',22000.00,60),(185,'Hộp 4 vỉ * 10 viên','PET ATP 3+ 600mg (>6kg - 8kg)',284,'THUOC','Viên',24000.00,40),(186,'Hộp 4 vỉ * 10 viên','Pet DHA (CKD - AKI) 650mg (>5kg - 10kg)',285,'THUOC','Viên',24000.00,40),(187,'Hộp 12 viên','Uri shield Chó',286,'THUOC','Viên',12000.00,1),(188,'Hộp 12 viên','Uri shield Mèo',287,'THUOC','Viên',12000.00,1),(189,'Lọ 45 viên','Urinovet Cat',288,'THUOC','Viên',25000.00,45),(190,'Lọ 30 viên ','Urinovet Dog',289,'THUOC','Viên',25000.00,30),(191,'Lọ 60 viên','Renalvet',290,'THUOC','Viên',15000.00,60),(192,'Check giá nhập Hộp 30 viên','Cystaid Plus',291,'THUOC','Viên',20000.00,30),(193,'Hộp 10 vỉ * 10 viên','Rowatinex',292,'THUOC','Viên',5000.00,100),(194,'Check giá nhậpHộp 10 vỉ * 5 ống 5ml','Kali Clorid 10%',293,'THUOC','Ống',10000.00,50),(195,'Lọ 45 viên','Neuro Support',294,'THUOC','Viên',32000.00,45),(196,'Check giá nhập Chai 100ml','Felemon',295,'THUOC','Chai',500000.00,1),(197,'Hộp 4 lọ','Vinrovit 5000',296,'THUOC','Lọ',30000.00,4),(198,'Check giá nhập Chai 100ml','Felemon',297,'THUOC','Chai',500000.00,1),(199,'Hộp 5 vỉ * 8 viên','Bio Probi 1g (10kg - 15kg)',298,'THUOC','Viên',20000.00,40),(200,'Hộp 5 vỉ * 8 viên','Bio Probi 2g (15kg - 20kg)',299,'THUOC','Viên',32000.00,40),(201,'Gói 10g','E.Lac',300,'THUOC','Gói',15000.00,1),(202,'Chai 10ml','Emetica For Cat ',301,'THUOC','Lọ',240000.00,1),(203,'Chai 10ml','Emetica For Dog',302,'THUOC','Lọ',360000.00,1),(204,'Hộp 10 gói 2g','Entergo IgY Chó',303,'THUOC','Gói',20000.00,1),(205,'Hộp 10 gói 1g','Entergo IgY Mèo',304,'THUOC','Gói',20000.00,1),(206,'Hộp 5 vỉ * 8 viên','Nutrizym Probi 2g (15kg - 20kg)',305,'THUOC','Viên',25000.00,40),(207,'Hộp 4 vỉ * 10 viên','Pet Bio 300mg (2kg - 5kg)',306,'THUOC','Viên',15000.00,40),(208,'Hộp 4 vỉ x 10 viên','Pet Nutribio 300mg (2kg - 5kg)',307,'THUOC','Viên',16000.00,40),(209,'Hộp 10 ống * 5ml','Prolax cho chó',308,'THUOC','Ống',12000.00,10),(210,'Hộp 10 ống * 5ml','Prolax cho mèo ',309,'THUOC','Ống',12000.00,10),(211,'Hộp 100 viên','Dr. Petz Liv-Von',310,'THUOC','Viên',20000.00,100),(212,'Chai100ml','Heparenol 100ml',311,'THUOC','Chai',180000.00,1),(213,'Lọ 40 viên','Hepatiale Forte',312,'THUOC','Viên',30000.00,40),(214,'Hộp 5 vỉ * 8 viên','Hepatic-BCAA 800mg',313,'THUOC','Viên',20000.00,40),(215,'Hộp 5 vỉ * 8 viên','Hepatic-Lipid 800mg',314,'THUOC','Viên',25000.00,40),(216,'Hộp 5 vỉ * 8 viên','High Protein 1g',315,'THUOC','Viên',24000.00,40),(217,'Hộp 4 vỉ * 10 viên','Immunity 300mg',316,'THUOC','Viên',14000.00,40),(218,'Lọ 10ml','Liver - Extra',317,'THUOC','Lọ',14000.00,1),(219,'Hộp 12 Viên','Liver shield Chó',318,'THUOC','Viên',15000.00,12),(220,'Hộp 12 Viên','Liver shield Mèo',319,'THUOC','Viên',15000.00,12),(221,'Hộp 4 vỉ * 10 viên','Pet DHA 3+ 600mg (6kg - 10kg)',320,'THUOC','Viên',20000.00,40),(222,'Hộp 4 vỉ * 10 viên','Pet Liver 350mg (>5kg - 10kg)',321,'THUOC','Viên',25000.00,40),(223,'Hộp 4 vỉ * 10 viên','Pet Sacal 600mg (>5kg - 10kg)',322,'THUOC','Viên',26000.00,40),(224,'Hộp 5 vỉ * 8 viên','Urso-Herbal 800mg (>5kg - 10kg)',323,'THUOC','Viên',25000.00,40),(225,'Hộp 3 ống * 3ml','Diaraid Chó',324,'THUOC','Ống',70000.00,3),(226,'Hộp 3 ống * 3ml','Diaraid Mèo',325,'THUOC','Ống',70000.00,3),(227,'Tuýp 85g','Petty gel 85g',326,'THUOC','Tuýp',200000.00,1),(228,'Hộp gồm 3 lọ đông khô + 3 ống dung môi','Atimezon',327,'THUOC','Lọ',40000.00,1),(229,'Ống 2ml','Atropin 2ml',328,'THUOC','Ống',10000.00,1),(230,'Lọ chiết 10ml','Kemecta',329,'THUOC','Lọ',40000.00,1),(231,'Hộp 10 ống * 5ml','Probi 28',330,'THUOC','Ống',22000.00,10),(232,'Hộp 10 ống x 10 ml','Suwelin 300mg',331,'THUOC','Ống',15000.00,10),(233,'Hộp 20 gói x 15 ml','Yumangel',332,'THUOC','Gói',10000.00,20),(234,'Hộp gồm 3 lọ đông khô + 3 ống dung môi','Glutathione 600mg',333,'THUOC','Lọ',150000.00,1),(235,'Chai 20 ml','Goliver 20ml (thông dụng)',334,'THUOC','Lọ',30000.00,1),(236,'Hộp 2 ống x 2 ml','Goliver 2ml (cao cấp)',335,'THUOC','Ống',80000.00,2),(237,'Xem lại giá nhập Hộp 10 ống * 5ml','Hepatyl cho chó',336,'THUOC','Ống',12000.00,10),(238,'Xem lại giá nhập Hộp 10 ống * 5ml','Hepatyl cho mèo',337,'THUOC','Ống',12000.00,10),(239,'Túi x 1 ống 3ml','Rectiofar',338,'THUOC','Ống',10000.00,1),(240,'Hộp 10 gói 6.8g','Doca lyte',339,'THUOC','Gói',10000.00,10),(241,'Chai 30 ml','Gastro Gel',340,'THUOC','Lọ',50000.00,1),(242,'Tuýp 85g','Petty gel 85g',341,'THUOC','Tuýp',200000.00,1),(243,'Hộp 50 gói * 5g','Probisol ',342,'THUOC','Gói',10000.00,50),(244,'Hộp 10 vỉ * 10 viên','Cardisure Flavoured',343,'THUOC','Viên',40000.00,100),(245,'Hộp 10 vỉ * 10 viên','Cardisure Flavoured',344,'THUOC','Viên',40000.00,100),(246,'Chai 100ml','Furovet',345,'THUOC','Ml',10000.00,1),(247,'Lọ 10 IU (đông khô) + dung môi pha','Virbragen Omega',346,'THUOC','Lọ',5000000.00,1),(248,'Lọ 10 IU (đông khô) + dung môi pha','Virbragen Omega',347,'THUOC','Lọ',5000000.00,1),(249,'Hộp 100 Viên','Caniverm forte tables 100x0.7g',348,'THUOC','Viên',50000.00,100),(250,'Hộp 100 Viên','Caniverm mite tables 100x0.175g',349,'THUOC','Viên',50000.00,100),(251,'Hộp 6 viên','Iverguard chó 11,6kg - 22,5kg',350,'THUOC','Viên',50000.00,6),(252,'Hộp 6 viên','Iverguard chó 2,5kg - 5,5kg',351,'THUOC','Viên',50000.00,6),(253,'Hộp 6 viên','Iverguard chó 5,6kg - 11,5kg',352,'THUOC','Viên',50000.00,6),(254,'Vỉ 10 viên','Kick tap - Cat',353,'THUOC','Viên',50000.00,10),(255,'Vỉ 10 viên','Kick tape - Dog',354,'THUOC','Viên',50000.00,10),(256,'Vỉ 10 viên','Kick tape - Dog S',355,'THUOC','Viên',50000.00,10),(257,'Hộp 3 tuýp','Nexgard Combo 0,3ml (< 2,5kg) (Cao cấp)',356,'THUOC','Tuýp',330000.00,3),(258,'Hộp 3 tuýp','Nexgard Combo 0,9ml (2,5kg - 7,5kg) (Cao cấp)',357,'THUOC','Tuýp',360000.00,3),(259,'Hộp 6 viên','Femitel 12 - 30mg (thông dụng)',358,'THUOC','Viên',50000.00,1),(260,'Hộp 6 viên','Femitel 4 - 10mg (thông dụng)',359,'THUOC','Viên',50000.00,1),(261,'Hộp 6 viên','HeartGard 68mcg (cao cấp)',360,'THUOC','Viên',120000.00,6),(262,'Hộp 6 viên','HeartGard 136mcg (cao cấp)',361,'THUOC','Viên',140000.00,6),(263,'Hộp 6 viên','HeartGard 272mcg (cao cấp)',362,'THUOC','Viên',160000.00,6),(264,'Hộp 5 tuýp','Nomecto spot on 0,4ml 2kg - 4,5kg',363,'THUOC','Tuýp',100000.00,5),(265,'Hộp 5 tuýp','Nomecto spot on 0,89ml 4,5kg - 10kg',364,'THUOC','Tuýp',120000.00,5),(266,'Lọ 20ml','Iveral',365,'THUOC','Lọ',100000.00,1),(267,'Hộp 3 viên','Nexgard Spectra 15,1kg - 30kg',366,'THUOC','Viên',500000.00,3),(268,'Hộp 3 viên','Nexgard Spectra 2kg - 3,5kg',367,'THUOC','Viên',350000.00,3),(269,'Hộp 3 viên','Nexgard Spectra 3,6kg - 7,5kg',368,'THUOC','Viên',380000.00,3),(270,'Hộp 3 viên','Nexgard Spectra 30,1kg - 60kg',369,'THUOC','Viên',520000.00,3),(271,'Hộp 3 viên','Nexgard Spectra 7,6kg - 15kg',370,'THUOC','Viên',460000.00,3),(272,'Hộp 3 tuýp','Frontline Plus Chó 0.67ml (Cao cấp) < 10kg',371,'THUOC','Tuýp',250000.00,3),(273,'Hộp 3 tuýp','Frontline Plus Chó 1.34ml (Cao cấp) 10kg - 20kg',372,'THUOC','Tuýp',260000.00,3),(274,'Hộp 3 tuýp','Frontline Plus Chó 2.68ml (Cao cấp) 20kg - 40kg',373,'THUOC','Tuýp',300000.00,3),(275,'Hộp 3 tuýp','Frontline Plus Mèo (Cao cấp)',374,'THUOC','Tuýp',250000.00,3),(276,'Chai 100 ml','Frontline Spray 100ml (Cao cấp)',375,'THUOC','Lọ',250000.00,1),(277,'Hộp 1 viên','Bravecto cho chó 2kg - 4,5kg',376,'THUOC','Viên',520000.00,1),(278,'Hộp 1 viên','Bravecto cho chó 4,5kg - 10kg',377,'THUOC','Viên',650000.00,1),(279,'Hộp 1 viên','Bravecto cho chó 10kg - 20kg',378,'THUOC','Viên',720000.00,1),(280,'Hộp 1 viên','Bravecto cho chó 20kg - 40kg',379,'THUOC','Viên',830000.00,1),(281,'Hộp 1 viên','Bravecto cho chó 40kg - 56kg',380,'THUOC','Viên',1300000.00,1),(282,'Hộp 1 tuýp. ','Bravecto cho mèo 2,8kg - 6,25kg',381,'THUOC','Tuýp',720000.00,1),(283,'Hộp 1 vỉ x 6 viên','Nexgard 2kg - 4kg',382,'THUOC','Viên',200000.00,6),(284,'Hộp 1 vỉ x 6 viên','Nexgard 4kg - 10kg',383,'THUOC','Viên',250000.00,6),(285,'Hộp 1 vỉ x 6 viên','Nexgard 10kg - 25kg',384,'THUOC','Viên',280000.00,6),(286,'Hộp 1 vỉ x 6 viên','Nexgard 25kg - 50kg',385,'THUOC','Viên',340000.00,6),(287,'Hộp 1 vỉ 2 viên','Endorgard 10 (Cao cấp)',386,'THUOC','Viên',100000.00,1),(288,'Hộp 10 viên','Vime Deworm',387,'THUOC','Viên',50000.00,1),(289,'Lọ 20 ml','Vime Deworm drop',388,'THUOC','Lọ',120000.00,1),(290,'Hộp 4 viên','Milpro cho chó con (0,5kg - 5kg)',389,'THUOC','Viên',100000.00,4),(291,'Hộp 4 viên','Milpro cho chó (5kg - 25kg)',390,'THUOC','Viên',100000.00,4),(292,'Hộp 4 viên','Milpro cho mèo con (0,5kg - 2kg)',391,'THUOC','Viên',100000.00,4),(293,'Hộp 4 viên','Milpro cho mèo (2kg - 8kg)',392,'THUOC','Viên',100000.00,4),(294,'Chai 5ml','Vimectin 0,3%',393,'THUOC','Lọ',100000.00,1),(295,'Hộp 3 viên','Simparica Trio L 20,1kg - 40kg',394,'THUOC','Viên',380000.00,3),(296,'Hộp 3 viên','Simparica Trio M 10,1kg - 20kg',395,'THUOC','Viên',250000.00,3),(297,'Hộp 3 viên','Simparica Trio S 5,1kg - 10kg',396,'THUOC','Viên',230000.00,3),(298,'Hộp 3 viên','Simparica Trio XS 2,6kg - 5kg',397,'THUOC','Viên',200000.00,3),(299,'Hộp 4 tuýp','Evicto Chó - Mèo < 2,5kg',398,'THUOC','Tuýp',210000.00,4),(300,'Hộp 4 tuýp','Evicto Chó 10,1kg - 20kg',399,'THUOC','Tuýp',300000.00,4),(301,'Hộp 4 tuýp','Evicto Chó 2,6kg - 5kg',400,'THUOC','Tuýp',320000.00,4),(302,'Hộp 4 tuýp','Evicto Chó 5,1kg - 10kg',401,'THUOC','Tuýp',350000.00,4),(303,'Hộp 4 tuýp','Evicto Mèo 2,6kg - 7,5kg',402,'THUOC','Tuýp',350000.00,4),(304,'Hộp 3 tuýp','Revolution mèo 0,25ml (< 2.5kg )',403,'THUOC','Tuýp',350000.00,3),(305,'Hộp 3 tuýp','Revolution mèo 0,75ml (> 2.5kg )',404,'THUOC','Tuýp',270000.00,3),(306,'Hộp 3 tuýp','Fronil extra 0.67ml (thông dụng)',405,'THUOC','Tuýp',100000.00,3),(307,'Hộp 3 tuýp','Fronil extra 1.34ml (thông dụng)',406,'THUOC','Tuýp',100000.00,3),(308,'Chai 5ml','Domax',407,'THUOC','Lọ',100000.00,1),(309,'Hộp 3 tuýp màu xanh','Imida Plus 0,23ml',408,'THUOC','Tuýp',100000.00,3),(310,'Hộp 3 tuýp màu cam','Imida Plus 0,4ml',409,'THUOC','Tuýp',100000.00,3),(311,'Chai 250 ml','Vime Frondog',410,'THUOC','Lọ',210000.00,1),(312,'Liều 1ml','Rabisin 1ds',411,'THUOC','Liều',80000.00,1),(313,'Liều 1ml','Recombitek C4',412,'THUOC','Liều',120000.00,1),(314,'Liều 1ml','Recombitek C6/CV',413,'THUOC','Liều',150000.00,1),(315,'Liều 1ml','Thuốc cho mèo 1',414,'THUOC','Liều',330000.00,1),(316,'Liều 1ml','Thuốc cho mèo 2',415,'THUOC','Liều',380000.00,1),(317,'Chai 20 ml','Ascorbic (Thông dụng)',416,'THUOC','Lọ',20000.00,1),(318,'Chai 20 ml','C-Glumin (Cao cấp)',417,'THUOC','Lọ',50000.00,1),(319,'Chai 100 ml','Bcom ADE ',418,'THUOC','Lọ',200000.00,1),(320,'Chai 100 ml','Vita Bcomplex ',419,'THUOC','Lọ',120000.00,1),(321,'Hộp 20 gói * 4ml','Shiny Chó',420,'THUOC','Gói',20000.00,20),(322,'Hộp 20 gói * 2ml','Shiny Mèo',421,'THUOC','Gói',15000.00,20),(323,'Chai 100ml','Dr. Petz Ferro Boost',422,'THUOC','Chai',260000.00,1),(324,'Hộp 20 gói *5ml','Calcium Delight - Chó (Thông dụng)',423,'THUOC','Gói',10000.00,1),(325,'Hộp 20 gói *2,5ml','Calcium Delight - Mèo (Thông dụng)',424,'THUOC','Gói',10000.00,1),(326,'Hộp 100 Viên','Dr. Petz Cal-mag',425,'THUOC','Viên',15000.00,100),(327,'Chai 500ml','Cofacalcium ',426,'THUOC','Ml',10000.00,1),(328,'Tuýp 100g','Exhair',427,'THUOC','Tuýp',180000.00,1),(329,'Hộp 6 lọ x 5ml','Decosanoic ',428,'THUOC','Lọ',130000.00,6),(330,'Lọ 30 viên','Multivitamin',429,'THUOC','Viên',7000.00,30),(331,'Hộp 6 lọ * 5ml','ATP 3+ ',430,'THUOC','Lọ',160000.00,6),(332,'Hộp 6 lọ * 5ml','B12 ATP ',431,'THUOC','Lọ',220000.00,6),(333,'Chai 100ml','Catolant ',432,'THUOC','Ml',10000.00,1),(334,'Chai 100ml','Vitamin K ',433,'THUOC','Ml',10000.00,1),(335,'Hộp 5 vỉ x 10 viên/ vỉ','Franvit C EX500 ',434,'THUOC','Viên',5000.00,50),(336,'Hộp 10 vỉ * 10 viên/ vỉ','Vitamin 3B Phúc Vinh',435,'THUOC','Viên',5000.00,100),(337,'Hộp 10 vỉ * 10 viên/ vỉ','Vitamin A-D Phúc Vinh',436,'THUOC','Viên',5000.00,100),(338,'Lọ 50 viên','Hemo Rooster Pets',437,'THUOC','Viên',5000.00,50),(339,'Lọ 10 ml','Hemofer 10% + B12 ',438,'THUOC','Lọ',35000.00,1),(340,'Hộp 30 viên','Calci delice (cao cấp)',439,'THUOC','Viên',20000.00,30),(341,'Gói 200gr','Đường Glucose ',440,'THUOC','Gói',15000.00,1),(342,'Hộp 50 ống x 5ml','Glucose 30%',441,'THUOC','Ống',10000.00,50),(343,'Hộp 10 ống x 5ml','Elecamin DB ',442,'THUOC','Ống',20000.00,10),(344,'Tuýp 120g','Nutri-Plus Gel (cao cấp)',443,'THUOC','Tuýp',320000.00,1),(345,'Tuýp 120g','Nuvita gel (thông dụng)',444,'THUOC','Tuýp',120000.00,1),(346,'Lọ 20 ml','Vimekat plus drop ',445,'THUOC','Lọ',100000.00,1),(347,'Hộp 1 ống 5ml','Vimekat ',446,'THUOC','Ống',100000.00,1),(348,'Chai 20ml','Vime - ATP (thông dụng)',447,'THUOC','Lọ',30000.00,1),(349,'Hộp 10 ống 5ml','Vime - ATP drop',448,'THUOC','Ống',30000.00,10),(350,'Hộp 2 ống 2ml','Vime - ATP Plus (cao cấp)',449,'THUOC','Ống',60000.00,2),(351,'Tuýp 60g','Boost Immu Chó',450,'THUOC','Tuýp',160000.00,1),(352,'Tuýp 60g','Boost Immu Mèo',451,'THUOC','Tuýp',160000.00,1),(353,NULL,'Áo mổ giấy',500,'VAT_TU','Chiếc',35000.00,1),(354,NULL,'Băng chun 2.5cm',500,'VAT_TU','Cuộn',15000.00,1),(355,NULL,'Băng chun 3 móc',500,'VAT_TU','Cuộn',30000.00,1),(356,NULL,'Băng chun 5cm',500,'VAT_TU','Cuộn',20000.00,1),(357,NULL,'Băng chun 7.5cm',500,'VAT_TU','Cuộn',25000.00,1),(358,NULL,'Băng keo Urgo 5cm',500,'VAT_TU','Cuộn',35000.00,1),(359,NULL,'Băng keo y tế 3M 2.5cm - Hộp 12 cuộn',500,'VAT_TU','Cuộn',40000.00,1),(360,NULL,'Băng keo y tế 3M 5cm - Hộp 6 cuộn',500,'VAT_TU','Cuộn',65000.00,1),(361,NULL,'Bộ dây truyền dịch',500,'VAT_TU','Chiếc',10000.00,1),(362,NULL,'Bộ kim cánh bướm G22',500,'VAT_TU','Chiếc',5000.00,1),(363,NULL,'Bơm tiêm 1ml',500,'VAT_TU','Chiếc',5000.00,1),(364,NULL,'Bơm tiêm 3ml',500,'VAT_TU','Chiếc',5000.00,1),(365,NULL,'Bơm tiêm 5ml',500,'VAT_TU','Chiếc',5000.00,1),(366,NULL,'Bơm tiêm 10ml',500,'VAT_TU','Chiếc',15000.00,1),(367,NULL,'Bơm tiêm 20ml',500,'VAT_TU','Chiếc',20000.00,1),(368,NULL,'Bơm tiêm 50ml',500,'VAT_TU','Chiếc',25000.00,1),(369,NULL,'Bông Bạch Tuyết (túi 10g)',500,'VAT_TU','Túi',25000.00,1),(370,NULL,'Bột bó thạch cao',500,'VAT_TU','Cuộn',20000.00,1),(371,NULL,'Bột cầm máu Showqueen',500,'VAT_TU','lọ',100000.00,1),(372,NULL,'Chỉ Catgut 0',500,'VAT_TU','Sợi',20000.00,1),(373,NULL,'Chỉ Catgut 1',500,'VAT_TU','Sợi',15000.00,1),(374,NULL,'Chỉ Catgut 2/0',500,'VAT_TU','Sợi',15000.00,1),(375,NULL,'Chỉ Catgut 3/0',500,'VAT_TU','Sợi',15000.00,1),(376,NULL,'Chỉ Catgut 5/0',500,'VAT_TU','Sợi',20000.00,1),(377,NULL,'Chỉ Nylon 0',500,'VAT_TU','Sợi',15000.00,1),(378,NULL,'Chỉ Nylon 2/0',500,'VAT_TU','Sợi',15000.00,1),(379,NULL,'Chỉ Nylon 3',500,'VAT_TU','Sợi',15000.00,1),(380,NULL,'Chỉ Nylon 3/0',500,'VAT_TU','Sợi',15000.00,1),(381,NULL,'Chỉ Polyglycolic Acid 0',500,'VAT_TU','Sợi',30000.00,1),(382,NULL,'Chỉ Polyglycolic Acid 1',500,'VAT_TU','Sợi',30000.00,1),(383,NULL,'Chỉ Polyglycolic Acid 2/0',500,'VAT_TU','Sợi',30000.00,1),(384,NULL,'Chỉ Polyglycolic Acid 3/0',500,'VAT_TU','Sợi',30000.00,1),(385,NULL,'Chỉ Polyglycolic Acid 4/0',500,'VAT_TU','Sợi',30000.00,1),(386,NULL,'Chỉ Silk Braided 2/0',500,'VAT_TU','Sợi',20000.00,1),(387,NULL,'Chỉ Silk Braided 3/0',500,'VAT_TU','Sợi',20000.00,1),(388,NULL,'Chỉ thép cuộn',500,'VAT_TU','Cuộn',210000.00,1),(389,NULL,'Cồn 70 Độ 100ml',500,'VAT_TU','Chai',30000.00,1),(390,NULL,'Đè lưỡi gỗ',500,'VAT_TU','chiếc',5000.00,1),(391,NULL,'Gạc cuộn 0,1m*2m',500,'VAT_TU','Cuộn',20000.00,1),(392,NULL,'Gạc vô trùng 10x10x8L',500,'VAT_TU','Chiếc',15000.00,1),(393,NULL,'Găng tay Phẫu thuật',500,'VAT_TU','Đôi',20000.00,1),(394,NULL,'Găng tay y tế có bột size M',500,'VAT_TU','Chiếc',5000.00,1),(395,NULL,'Găng tay y tế có bột size S',500,'VAT_TU','Chiếc',5000.00,1),(396,NULL,'Găng tay y tế không bột size M',500,'VAT_TU','Chiếc',5000.00,1),(397,NULL,'Găng tay y tế không bột size S',500,'VAT_TU','Chiếc',5000.00,1),(398,NULL,'Iodine 60ml',500,'VAT_TU','chai',35000.00,1),(399,NULL,'Khẩu trang y tế',500,'VAT_TU','Chiếc',7000.00,1),(400,NULL,'Kim bướm G23',500,'VAT_TU','Chiếc',5000.00,1),(401,NULL,'Kim bướm G25',500,'VAT_TU','Chiếc',5000.00,1),(402,NULL,'Kim châm cứu',500,'VAT_TU','Chiếc',5000.00,1),(403,NULL,'Kim luồn tím 26G',500,'VAT_TU','Chiếc',10000.00,1),(404,NULL,'Kim luồn vàng 24G',500,'VAT_TU','Chiếc',10000.00,1),(405,NULL,'Kim luồn xanh 22G',500,'VAT_TU','Chiếc',10000.00,1),(406,NULL,'Kim sắt 7',500,'VAT_TU','Chiếc',5000.00,1),(407,NULL,'Lót vệ sinh Dono - bịch 100 miếng',500,'VAT_TU','chiếc',5000.00,1),(408,NULL,'Lót vệ sinh Dono - bịch 50 miếng',500,'VAT_TU','chiếc',5000.00,1),(409,NULL,'Lưỡi dao mổ 15 Kiato',500,'VAT_TU','Chiếc',5000.00,1),(410,NULL,'Lưỡi dao mổ 20 Kiato',500,'VAT_TU','Chiếc',5000.00,1),(411,NULL,'Miếng dán phẫu thuật 5*7cm',500,'VAT_TU','Chiếc',5000.00,1),(412,NULL,'Miếng dán phẫu thuật 6*9cm',500,'VAT_TU','Chiếc',5000.00,1),(413,NULL,'Miếng dán phẫu thuật 9*10cm',500,'VAT_TU','Chiếc',5000.00,1),(414,NULL,'Mũ giấy',500,'VAT_TU','Chiếc',5000.00,1),(415,NULL,'Nước tự cứng Duracryl',500,'VAT_TU','Chai',286000.00,1),(416,NULL,'Ống hút dịch',500,'VAT_TU','Chiếc',10000.00,1),(417,NULL,'Ống nội khí quản 2.0',500,'VAT_TU','Chiếc',50000.00,1),(418,NULL,'Ống nội khí quản 2.5',500,'VAT_TU','Chiếc',50000.00,1),(419,NULL,'Ống nội khí quản 3.0',500,'VAT_TU','Chiếc',50000.00,1),(420,NULL,'Ống nội khí quản 3.5',500,'VAT_TU','Chiếc',50000.00,1),(421,NULL,'Ống nội khí quản 4.0',500,'VAT_TU','Chiếc',50000.00,1),(422,NULL,'Ống nội khí quản 4.5',500,'VAT_TU','Chiếc',50000.00,1),(423,NULL,'Ống nội khí quản 5.0',500,'VAT_TU','Chiếc',50000.00,1),(424,NULL,'Ống Sonde dạ dày',500,'VAT_TU','Chiếc',50000.00,1),(425,NULL,'Oxy già 10ml',500,'VAT_TU','chai',10000.00,1),(426,NULL,'Săng mổ Phúc Hà 60x80 cm',500,'VAT_TU','Chiếc',20000.00,1),(427,NULL,'Tăm bông vô trùng',500,'VAT_TU','Chiếc',10000.00,1),(428,NULL,'Tấm trải Nylon VT',500,'VAT_TU','Chiếc',20000.00,1),(429,NULL,'Thuốc bột cản quang Bari Sulfal',500,'VAT_TU','Gói',100000.00,1),(430,NULL,'Thuốc sát trùng CloraminB',500,'VAT_TU','Kg',200000.00,1);
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `message` text,
  `target_role` varchar(255) DEFAULT NULL,
  `target_user_id` bigint DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-04-16 18:31:32.636232',_binary '',NULL,'Bạn được phân công một phiếu tiếp nhận mới cho thú cưng Mickey',NULL,1,'Phiếu tiếp nhận mới','NEW_RECEPTION'),(2,'2026-04-16 18:41:19.567411',_binary '','/techs/record-result/1','Bạn được chỉ định thực hiện dịch vụ Dịch vụ CT scan chi sau cho Mickey',NULL,15,'Phân công dịch vụ mới','TECH_ASSIGNMENT'),(3,'2026-04-16 18:52:49.934703',_binary '\0',NULL,'KTV đã cập nhật kết quả dịch vụ Dịch vụ CT scan chi sau cho thú cưng Mickey',NULL,1,'Kết quả dịch vụ đã cập nhật','TECH_RESULT');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_method`
--

DROP TABLE IF EXISTS `payment_method`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_method` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_method`
--

LOCK TABLES `payment_method` WRITE;
/*!40000 ALTER TABLE `payment_method` DISABLE KEYS */;
INSERT INTO `payment_method` VALUES (1,'Tiền mặt'),(2,'Chuyển khoản');
/*!40000 ALTER TABLE `payment_method` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet`
--

DROP TABLE IF EXISTS `pet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `breed` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `species` varchar(255) NOT NULL,
  `client_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkr3ikmj59xajmfnnqh5ut5hqr` (`client_id`),
  CONSTRAINT `FKkr3ikmj59xajmfnnqh5ut5hqr` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet`
--

LOCK TABLES `pet` WRITE;
/*!40000 ALTER TABLE `pet` DISABLE KEYS */;
INSERT INTO `pet` VALUES (1,'Poodle','2025-09-28','Mickey','cho',1);
/*!40000 ALTER TABLE `pet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_result_id` bigint NOT NULL,
  `reception_service_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3kv530otd1sfv47dxljlpt7yu` (`reception_service_id`),
  KEY `FK5osmot4vbd3dc2fv7rn4gv3ng` (`exam_result_id`),
  CONSTRAINT `FK10qkkrs7fi4oay9vh9ex8ykrk` FOREIGN KEY (`reception_service_id`) REFERENCES `reception_services` (`id`),
  CONSTRAINT `FK5osmot4vbd3dc2fv7rn4gv3ng` FOREIGN KEY (`exam_result_id`) REFERENCES `exam_result` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES (1,1,1),(2,1,2);
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_detail`
--

DROP TABLE IF EXISTS `prescription_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dose_afternoon` int DEFAULT NULL,
  `dosage_unit` varchar(255) DEFAULT NULL,
  `dose_evening` int DEFAULT NULL,
  `instruction` text,
  `dose_morning` int DEFAULT NULL,
  `dose_noon` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `medicine_id` bigint NOT NULL,
  `prescription_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKik2mm986ygebo4kq2kvl3hcdu` (`medicine_id`),
  KEY `FKdq2yagbksdomo6t1o1b8g3poe` (`prescription_id`),
  CONSTRAINT `FKdq2yagbksdomo6t1o1b8g3poe` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `FKik2mm986ygebo4kq2kvl3hcdu` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_detail`
--

LOCK TABLES `prescription_detail` WRITE;
/*!40000 ALTER TABLE `prescription_detail` DISABLE KEYS */;
INSERT INTO `prescription_detail` VALUES (3,0,'lọ',1,'',1,0,1,68,1),(4,1,'chiếc',1,'',1,1,1,368,1),(5,1,'chiếc',1,NULL,1,1,1,353,2);
/*!40000 ALTER TABLE `prescription_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reception_record`
--

DROP TABLE IF EXISTS `reception_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reception_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_reason` varchar(1000) DEFAULT NULL,
  `note` text,
  `reception_time` datetime(6) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `client_id` bigint NOT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `exam_form_id` bigint NOT NULL,
  `pet_id` bigint NOT NULL,
  `receptionist_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKanax2357qa8r0wuwk0w9j8n5v` (`client_id`),
  KEY `FKgt9yam647xtdgh3g4w4p64bqn` (`doctor_id`),
  KEY `FK55yi23aig2nmcpdy3yy2qsadk` (`exam_form_id`),
  KEY `FKd29w9d1hyn1nfmrrr1lt4aa67` (`pet_id`),
  KEY `FKaglxrbc2ai4481niabn1gajnk` (`receptionist_id`),
  CONSTRAINT `FK55yi23aig2nmcpdy3yy2qsadk` FOREIGN KEY (`exam_form_id`) REFERENCES `exam_form` (`id`),
  CONSTRAINT `FKaglxrbc2ai4481niabn1gajnk` FOREIGN KEY (`receptionist_id`) REFERENCES `receptionist` (`id`),
  CONSTRAINT `FKanax2357qa8r0wuwk0w9j8n5v` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `FKd29w9d1hyn1nfmrrr1lt4aa67` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`id`),
  CONSTRAINT `FKgt9yam647xtdgh3g4w4p64bqn` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_record`
--

LOCK TABLES `reception_record` WRITE;
/*!40000 ALTER TABLE `reception_record` DISABLE KEYS */;
INSERT INTO `reception_record` VALUES (1,'bỏ ăn','','2026-04-16 18:31:32.614971','chờ kết luận',4.00,1,1,1,1,8);
/*!40000 ALTER TABLE `reception_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reception_services`
--

DROP TABLE IF EXISTS `reception_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reception_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `status` enum('COMPLETED','IN_PROGRESS','PENDING') DEFAULT NULL,
  `reception_record_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2a574tm00ontq3223tsp4hon7` (`reception_record_id`,`service_id`),
  KEY `FK44d2a1y1whpjf9msrxnvek7jc` (`service_id`),
  CONSTRAINT `FK44d2a1y1whpjf9msrxnvek7jc` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  CONSTRAINT `FK9kw61t8c15wk87g6uw6r3sayx` FOREIGN KEY (`reception_record_id`) REFERENCES `reception_record` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_services`
--

LOCK TABLES `reception_services` WRITE;
/*!40000 ALTER TABLE `reception_services` DISABLE KEYS */;
INSERT INTO `reception_services` VALUES (1,'2026-04-16 18:31:32.630156','2026-04-16 18:32:21.763066','COMPLETED',1,1),(2,'2026-04-16 18:41:19.573346','2026-04-16 18:42:29.018414','COMPLETED',1,130);
/*!40000 ALTER TABLE `reception_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receptionist`
--

DROP TABLE IF EXISTS `receptionist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receptionist` (
  `id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK7o3aavnbroyt94o6gvw59qmv8` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receptionist`
--

LOCK TABLES `receptionist` WRITE;
/*!40000 ALTER TABLE `receptionist` DISABLE KEYS */;
INSERT INTO `receptionist` VALUES (6),(7),(8),(9),(10);
/*!40000 ALTER TABLE `receptionist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (1,'Dịch vụ khám Tổng quát',300000.00),(2,'Dịch vụ Xét nghiệm công thức máu 18 chỉ tiêu',200000.00),(3,'Dịch vụ Xét nghiệm công thức máu 24 chỉ tiêu',250000.00),(4,'Dịch vụ Xét nghiệm sinh hóa Gan, thận (ALT, AST, Ure, Crea)',200000.00),(5,'Dịch vụ Xét nghiệm chỉ số đông máu (APTT, PT, TT, Fib)',400000.00),(6,'Dịch vụ Xét nghiệm sinh hóa cơ bản 16 chỉ tiêu (ALB, AMY, ALP, ALT,\nCHE, GLU, K+, Na+, Crea, TB, TP, UA, BUN,\nA/G*, B/C*, BLOB*)',400000.00),(7,'Dịch vụ Xét nghiệm sinh hóa cơ bản 24 chỉ tiêu (ALB, ALP, ALT, AMY, AST, Ca, CK, Crea, GLU, GGT, TG, LDH, LPS, PHOS, UA, TBA, TB, TC, tCO2, TP, BUN, A/G*, B/C*, GLOB*)',700000.00),(8,'Dịch vụ Xét nghiệm điện giải 13 chỉ tiêu (Ca, CL-, K+, Mg, Na+, PHOS, tCO2, Ph, Crea, GLU, LAC, BUN, B/C*)',350000.00),(9,'Dịch vụ Xét nghiệm khí máu',500000.00),(10,'Dịch vụ Xét nghiệm nước tiểu bằng que thử',200000.00),(11,'Dịch vụ Xét nghiệm nước tiểu bằng máy phân tích',200000.00),(12,'Dịch vụ Xét nghiệm điện giải nước tiểu',200000.00),(13,'Dịch vụ Soi da bằng đèn Wood',200000.00),(14,'Dịch vụ Test nhanh 5 bệnh CCV/ CPC / GIA / HP/ CRV Ag',350000.00),(15,'Dịch vụ Test nhanh 3 bệnh E.canis/ Babesia/ Anaplasma',500000.00),(16,'Dịch vụ Test nhanh 5 bệnh E.canis/ Babesia/ Anaplasma/ Lepto/ Lime Ab',600000.00),(17,'Dịch vụ Test nhanh 2 bệnh FCV/ FHV-1',400000.00),(18,'Dịch vụ Test nhanh 4 bệnh FPV/ GIA/ FcoV/ FRV Ag',700000.00),(19,'Dịch vụ Test nhanh 2 bệnh CCV/ CPV Ag',300000.00),(20,'Dịch vụ Xét nghiệm 1,25(OH)₂ Vitamin D máu',600000.00),(21,'Dịch vụ Xét nghiệm chức năng đông máu',400000.00),(22,'Dịch vụ Xét nghiệm c-peptide máu',600000.00),(23,'Dịch vụ Xét nghiệm dị nguyên',1500000.00),(24,'Dịch vụ Xét nghiệm chu kì động dục ở chó',400000.00),(25,'Dịch vụ Xét nghiệm Fructosamine máu',600000.00),(26,'Dịch vụ Xét nghiệm FT4 (Free T4) máu',600000.00),(27,'Dịch vụ Xét nghiệm Insulin máu',600000.00),(28,'Dịch vụ Xét nghiệm kháng sinh đồ',600000.00),(29,'Dịch vụ Xét nghiệm kháng thể',600000.00),(30,'Dịch vụ Xét nghiệm kích thích ACTH',600000.00),(31,'Dịch vụ Xét nghiệm máu sơ sinh',600000.00),(32,'Dịch vụ Xét nghiệm miễn dịch học tế bào',600000.00),(33,'Dịch vụ Xét nghiệm miễn dịch huỳnh quang trực tiếp mẫu da',600000.00),(34,'Dịch vụ Xét nghiệm mô học',1000000.00),(35,'Dịch vụ Xét nghiệm nhuộm huỳnh quang trực tiếp mẫu da',600000.00),(36,'Dịch vụ Xét nghiệm nhuộm soi da',250000.00),(37,'Dịch vụ Xét nghiệm nhuộm soi dịch tiết',250000.00),(38,'Dịch vụ Xét nghiệm nhuộm soi máu',250000.00),(39,'Dịch vụ Xét nghiệm nhuộm soi nước tiểu',250000.00),(40,'Dịch vụ Xét nghiệm nhuộm soi phân',250000.00),(41,'Dịch vụ Xét nghiệm nước tiểu bằng máy phân tích',200000.00),(42,'Dịch vụ Xét nghiệm nước tiểu bằng que thử',150000.00),(43,'Dịch vụ Xét nghiệm PTH máu',600000.00),(44,'Dịch vụ Xét nghiệm PTHrP máu',600000.00),(45,'Dịch vụ Xét nghiệm soi tươi da',150000.00),(46,'Dịch vụ Xét nghiệm soi tươi dịch tiết',150000.00),(47,'Dịch vụ Xét nghiệm soi tươi máu',200000.00),(48,'Dịch vụ Xét nghiệm soi tươi nước tiểu',150000.00),(49,'Dịch vụ Xét nghiệm soi tươi phân',150000.00),(50,'Dịch vụ Xét nghiệm soi tươi tinh dịch',150000.00),(51,'Dịch vụ Xét nghiệm tế bào học',600000.00),(52,'Dịch vụ Xét nghiệm tinh dịch',500000.00),(53,'Dịch vụ Xét nghiệm TSH máu',900000.00),(54,'Dịch vụ Xét nghiệm TT4 (Total T4) máu',900000.00),(55,'Dịch vụ Xét nghiệm Tủy xương',2000000.00),(56,'Dịch vụ Xét nghiệm ức chế bằng liều thấp dexamethasone',500000.00),(57,'Dịch vụ Xét nghiệm 25(OH) Vitamin D máu',500000.00),(58,'Dịch vụ Xét nghiệm kháng sinh đồ',1000000.00),(59,'Dịch vụ Xét nghiệm nhuộm soi tinh dịch',200000.00),(60,'Dịch vụ Nội soi bàng quang',1500000.00),(61,'Dịch vụ Nội soi hầu họng',1500000.00),(62,'Dịch vụ Nội soi khí quản',1500000.00),(63,'Dịch vụ Nội soi lấy mẫu sinh thiết',1500000.00),(64,'Dịch vụ Nội soi ống tiêu hóa',1500000.00),(65,'Dịch vụ Nội soi phế quản',1500000.00),(66,'Dịch vụ Nội soi Tai - Mũi - Họng',1500000.00),(67,'Dịch vụ Nội soi thực quản',1500000.00),(68,'Dịch vụ Siêu âm Abscess, khối u, khối sưng',300000.00),(69,'Dịch vụ Siêu âm bụng tổng quát',300000.00),(70,'Dịch vụ Siêu âm cấp cứu',300000.00),(71,'Dịch vụ Siêu âm cơ',200000.00),(72,'Dịch vụ Siêu âm cơ xương khớp',200000.00),(73,'Dịch vụ Siêu âm dạ dày, ruột non, ruột già',200000.00),(74,'Dịch vụ Siêu âm gan mật',200000.00),(75,'Dịch vụ Siêu âm hạch',200000.00),(76,'Dịch vụ Siêu âm hệ sinh dục cái',200000.00),(77,'Dịch vụ Siêu âm hệ sinh dục đực',200000.00),(78,'Dịch vụ Siêu âm hệ tiết niệu',200000.00),(79,'Dịch vụ Siêu âm khớp',200000.00),(80,'Dịch vụ Siêu âm lách',200000.00),(81,'Dịch vụ Siêu âm mắt',250000.00),(82,'Dịch vụ Siêu âm mô mềm',200000.00),(83,'Dịch vụ Siêu âm ngực',200000.00),(84,'Dịch vụ Siêu âm Răng - Hàm - Mặt',200000.00),(85,'Dịch vụ Siêu âm sọ',200000.00),(86,'Dịch vụ Siêu âm Tai - Mũi - Họng',200000.00),(87,'Dịch vụ Siêu âm thai',200000.00),(88,'Dịch vụ Siêu âm theo dõi đẻ',500000.00),(89,'Dịch vụ Siêu âm thực quản',250000.00),(90,'Dịch vụ Siêu âm tim',500000.00),(91,'Dịch vụ Siêu âm tuyến giáp và tuyến cận giáp',250000.00),(92,'Dịch vụ Siêu âm tuyến tụy',250000.00),(93,'Dịch vụ Siêu âm xương',250000.00),(94,'Dịch vụ X-Quang tổng quát',800000.00),(95,'Dịch vụ X-Quang bụng',200000.00),(96,'Dịch vụ X-Quang bụng, chậu',200000.00),(97,'Dịch vụ X-Quang cấp cứu',200000.00),(98,'Dịch vụ X-Quang chi sau',200000.00),(99,'Dịch vụ X-Quang chi trước',200000.00),(100,'Dịch vụ X-Quang Chụp loạn sản khớp khuỷu (ED)',500000.00),(101,'Dịch vụ X-Quang Chụp loạn sản xương hông (HD)',500000.00),(102,'Dịch vụ X-Quang cổ',200000.00),(103,'Dịch vụ X-Quang cổ, ngực',200000.00),(104,'Dịch vụ X-quang cột sống',200000.00),(105,'Dịch vụ X-Quang dạ dày ruột có uống Barium',1200000.00),(106,'Dịch vụ X-Quang đầu',200000.00),(107,'Dịch vụ X-Quang đầu, cổ, ngực',200000.00),(108,'Dịch vụ X-Quang hệ tiết niệu',200000.00),(109,'Dịch vụ X-Quang khí quản',200000.00),(110,'Dịch vụ X-Quang lỗ chẩm',200000.00),(111,'Dịch vụ X-Quang mô mềm',200000.00),(112,'Dịch vụ X-Quang ngực',200000.00),(113,'Dịch vụ X-Quang ngực, bụng',200000.00),(114,'Dịch vụ X-Quang ngực, bụng, chậu',200000.00),(115,'Dịch vụ X-Quang ống tiêu hóa có uống Barium',1200000.00),(116,'Dịch vụ X-Quang răng',200000.00),(117,'Dịch vụ X-Quang Tai - Mũi - Họng',200000.00),(118,'Dịch vụ X-Quang tai giữa',200000.00),(119,'Dịch vụ X-Quang thực quản',200000.00),(120,'Dịch vụ X-Quang thực quản, dạ dày có uống Barium',1200000.00),(121,'Dịch vụ X-Quang xoang trán',200000.00),(122,'Dịch vụ X-Quang xương bả vai',200000.00),(123,'Dịch vụ X-Quang xương bàn ngón chi sau',200000.00),(124,'Dịch vụ X-Quang xương bàn ngón chi trước',200000.00),(125,'Dịch vụ X-Quang xương cánh tay',200000.00),(126,'Dịch vụ X-Quang xương chậu',200000.00),(127,'Dịch vụ X-Quang xương chày, xương mác',200000.00),(128,'Dịch vụ X-Quang xương đùi',200000.00),(129,'Dịch vụ X-Quang xương quay, xương trụ',200000.00),(130,'Dịch vụ CT scan chi sau',4000000.00),(131,'Dịch vụ CT scan chi trước',4000000.00),(132,'Dịch vụ CT scan sọ não',4000000.00),(133,'Dịch vụ CT scan vùng bụng',4000000.00),(134,'Dịch vụ CT scan vùng chậu',4000000.00),(135,'Dịch vụ CT scan vùng cổ',4000000.00),(136,'Dịch vụ CT scan vùng ngực',4000000.00),(137,'Dịch vụ MRI chi sau',8000000.00),(138,'Dịch vụ MRI chi trước',8000000.00),(139,'Dịch vụ MRI sọ não',8000000.00),(140,'Dịch vụ MRI vùng bụng',8000000.00),(141,'Dịch vụ MRI vùng chậu',8000000.00),(142,'Dịch vụ MRI vùng cổ',8000000.00),(143,'Dịch vụ MRI vùng ngực',8000000.00),(144,'Dịch vụ Điện cơ đồ',600000.00),(145,'Dịch vụ Điện não đồ',600000.00),(146,'Dịch vụ Điện tâm đồ',300000.00),(147,'Dịch vụ Test nước mắt Schirmer tear (STT)',200000.00),(148,'Dịch vụ Đo nhãn áp',200000.00),(149,'Dịch vụ Soi đáy mắt',50000.00),(150,'Dịch vụ Test rò dịch thủy dịch',200000.00);
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_order`
--

DROP TABLE IF EXISTS `service_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `medical_record_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  `technician_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7dtme4xga39criqgmshal2sec` (`medical_record_id`),
  KEY `FK2m1fn4id32tpsgvgh427cvyc8` (`service_id`),
  KEY `FKdt3sw0ifpvp4bu38sxy0o1ylt` (`technician_id`),
  CONSTRAINT `FK2m1fn4id32tpsgvgh427cvyc8` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  CONSTRAINT `FK7dtme4xga39criqgmshal2sec` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKdt3sw0ifpvp4bu38sxy0o1ylt` FOREIGN KEY (`technician_id`) REFERENCES `technician` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_order`
--

LOCK TABLES `service_order` WRITE;
/*!40000 ALTER TABLE `service_order` DISABLE KEYS */;
INSERT INTO `service_order` VALUES (1,1,130,15);
/*!40000 ALTER TABLE `service_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_result`
--

DROP TABLE IF EXISTS `service_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_result` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `end_time` datetime(6) DEFAULT NULL,
  `evidence_path` varchar(255) DEFAULT NULL,
  `result` text,
  `start_time` datetime(6) DEFAULT NULL,
  `service_order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd665vrsc01na9tq9vllcm8f5x` (`service_order_id`),
  CONSTRAINT `FKpk62h5pa1wa6ib2tiga4nr76t` FOREIGN KEY (`service_order_id`) REFERENCES `service_order` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_result`
--

LOCK TABLES `service_result` WRITE;
/*!40000 ALTER TABLE `service_result` DISABLE KEYS */;
INSERT INTO `service_result` VALUES (1,'2026-04-16 18:52:49.846118','./storage/tech-results/tech-result-1776340369813-da6c3e4a-12a4-4e86-bb0c-8165df76147b.png','Hello test','2026-04-16 18:42:29.006348',1);
/*!40000 ALTER TABLE `service_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technician`
--

DROP TABLE IF EXISTS `technician`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technician` (
  `id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK1bfh8sjcmus2292s6vijeb3bu` FOREIGN KEY (`id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technician`
--

LOCK TABLES `technician` WRITE;
/*!40000 ALTER TABLE `technician` DISABLE KEYS */;
INSERT INTO `technician` VALUES (11),(12),(13),(14),(15);
/*!40000 ALTER TABLE `technician` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatment_direction`
--

DROP TABLE IF EXISTS `treatment_direction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatment_direction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatment_direction`
--

LOCK TABLES `treatment_direction` WRITE;
/*!40000 ALTER TABLE `treatment_direction` DISABLE KEYS */;
INSERT INTO `treatment_direction` VALUES (1,'Cho về'),(2,'Điều trị nội trú'),(3,'Điều trị ngoại trú'),(4,'Khám cận lâm sàng');
/*!40000 ALTER TABLE `treatment_direction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatment_slip`
--

DROP TABLE IF EXISTS `treatment_slip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatment_slip` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `plan` text,
  `type` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `medical_record_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKliwbq6j1lgmnqwt92kmbu6w7s` (`created_by`),
  KEY `FK3jbso7abds31ogisavppxsqh` (`medical_record_id`),
  CONSTRAINT `FK3jbso7abds31ogisavppxsqh` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKliwbq6j1lgmnqwt92kmbu6w7s` FOREIGN KEY (`created_by`) REFERENCES `doctor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatment_slip`
--

LOCK TABLES `treatment_slip` WRITE;
/*!40000 ALTER TABLE `treatment_slip` DISABLE KEYS */;
/*!40000 ALTER TABLE `treatment_slip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar_path` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4bgmpi98dylab6qdvf9xyaxu4` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'./storage/Untitled.jpg','Nguyễn Minh Anh','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0901000000'),(2,'./storage/Untitled.jpg','Trần Quốc Bảo','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0901000001'),(3,'./storage/Untitled.jpg','Lê Thanh Huyền','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0901000002'),(4,'./storage/Untitled.jpg','Phạm Gia Hưng','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0901000003'),(5,'./storage/Untitled.jpg','Hoàng Ngọc Linh','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0901000004'),(6,'./storage/Untitled.jpg','Vũ Đức Anh','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0902000000'),(7,'./storage/Untitled.jpg','Đặng Quỳnh Chi','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0902000001'),(8,'./storage/Untitled.jpg','Bùi Tuấn Kiệt','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0902000002'),(9,'./storage/Untitled.jpg','Phan Thị Mai','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0902000003'),(10,'./storage/Untitled.jpg','Đỗ Nhật Nam','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0902000004'),(11,'./storage/Untitled.jpg','Hồ Khánh Vy','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0903000000'),(12,'./storage/Untitled.jpg','Trịnh Công Sơn','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0903000001'),(13,'./storage/Untitled.jpg','Nguyễn Hoài An','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0903000002'),(14,'./storage/Untitled.jpg','Lý Hải Đăng','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0903000003'),(15,'./storage/Untitled.jpg','Cao Minh Trí','$2a$12$NCaVAOC1QJGqn6T5wLNaY.3PsrRUFBSp/qnC7WZT.oKXakDMUzK7m','0903000004');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16 19:29:49
