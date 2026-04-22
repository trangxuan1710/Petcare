-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 192.168.10.106    Database: petical
-- ------------------------------------------------------
-- Server version	8.4.8

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

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbt1ji0od8t2mhp0thot6pod8u` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'Nguyễn Văn A','0987876564'),(2,'Nguyễn Thị Thu','0998856432'),(3,'Nguyễn Thị Thu Thảo','0987564531'),(4,'Ngô Thị Đào','0123456789');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
-- Table structure for table `exam_result`
--

DROP TABLE IF EXISTS `exam_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_result` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conclusion` text COLLATE utf8mb4_unicode_ci,
  `end_time` datetime(6) DEFAULT NULL,
  `evidence_path` text COLLATE utf8mb4_unicode_ci,
  `start_time` datetime(6) DEFAULT NULL,
  `medical_record_id` bigint NOT NULL,
  `treatment_direction_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKofr05cs6ytmoggpu6dnmkf2al` (`medical_record_id`),
  KEY `FKrxswaqe0voedt341h1998prlt` (`treatment_direction_id`),
  CONSTRAINT `FKofr05cs6ytmoggpu6dnmkf2al` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKrxswaqe0voedt341h1998prlt` FOREIGN KEY (`treatment_direction_id`) REFERENCES `treatment_direction` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_result`
--

LOCK TABLES `exam_result` WRITE;
/*!40000 ALTER TABLE `exam_result` DISABLE KEYS */;
INSERT INTO `exam_result` VALUES (1,'test',NULL,NULL,'2026-04-19 17:06:14.087217',6,3),(2,'Tessst',NULL,NULL,'2026-04-19 17:19:22.395816',7,3);
/*!40000 ALTER TABLE `exam_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_type_options`
--

DROP TABLE IF EXISTS `exam_type_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_type_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_type` enum('NEW_EXAM','RE_EXAM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_type_options_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_type_options`
--

LOCK TABLES `exam_type_options` WRITE;
/*!40000 ALTER TABLE `exam_type_options` DISABLE KEYS */;
INSERT INTO `exam_type_options` VALUES (1,_binary '','khammoi','NEW_EXAM','Khám mới',1),(2,_binary '','taikham','RE_EXAM','Tái khám',2);
/*!40000 ALTER TABLE `exam_type_options` ENABLE KEYS */;
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
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,'2026-04-19 17:20:14.098374','Thanh toán chuyển khoản VCB','2026-04-19 17:20:14.098374','PAID',4300000.00,6,2,6);
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
  `emergency` bit(1) NOT NULL,
  `exam_date` datetime(6) DEFAULT NULL,
  `status` enum('COMPLETED','IN_PROGRESS','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` bigint NOT NULL,
  `exam_type_option_id` bigint DEFAULT NULL,
  `reception_record_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmommgymv6rayvbje0hp4c6g8w` (`doctor_id`),
  KEY `FKcywsle2l3yfv6v4qi1h9wx786` (`exam_type_option_id`),
  KEY `FK898mi6c02r4s7fxp8awgqsfe0` (`reception_record_id`),
  CONSTRAINT `FK898mi6c02r4s7fxp8awgqsfe0` FOREIGN KEY (`reception_record_id`) REFERENCES `reception_record` (`id`),
  CONSTRAINT `FKcywsle2l3yfv6v4qi1h9wx786` FOREIGN KEY (`exam_type_option_id`) REFERENCES `exam_type_options` (`id`),
  CONSTRAINT `FKmommgymv6rayvbje0hp4c6g8w` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_record`
--

LOCK TABLES `medical_record` WRITE;
/*!40000 ALTER TABLE `medical_record` DISABLE KEYS */;
INSERT INTO `medical_record` VALUES (5,_binary '',NULL,'PENDING',1,1,5),(6,_binary '\0','2026-04-19 16:26:32.899470','PENDING',1,1,6),(7,_binary '\0','2026-04-19 17:15:38.054449','PENDING',1,1,7),(8,_binary '\0',NULL,'PENDING',1,1,8);
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
  `description` text COLLATE utf8mb4_unicode_ci,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_per_box` int DEFAULT NULL,
  `stock_quantity` int NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES (1,'Amoxicillin 125mg','Amentyl (cao cấp)',40,100,'THUOC','Viên',30000.00),(2,'Amoxicillin 200mg','Clamox tab (thông dụng)',10,100,'THUOC','Viên',7000.00),(3,'Cefalexin 300mg','Lixen Tablets',49,100,'THUOC','Viên',14000.00),(4,'Enrofloxacin 50mg','Enroko 50mg',10,100,'THUOC','Viên',8000.00),(5,'Enrofloxacin 50mg','Enro plus 50mg',10,100,'THUOC','Viên',15000.00),(6,'Enrofloxacin 50mg','Enrocin Tab 50mg',100,100,'THUOC','Viên',5000.00),(7,'Pradofloxacin 200mg','Tiaflox 200mg (>2,5kg - 5kg)',40,100,'THUOC','Viên',50000.00),(8,'Marbofloxacin 250mg','Marbo 250mg (>5kg - 10kg) (cao cấp)',40,100,'THUOC','Viên',22000.00),(9,'Doxycycline 500mg','Doxycilin Tablet 6 - 500mg',40,100,'THUOC','Viên',46000.00),(10,'Doxycycline 1g','Doxycycline - 1g (>17,1kg - 21kg)',40,100,'THUOC','Viên',260000.00),(11,'Doxycycline 800mg','Doxycycline Base 800mg',40,100,'THUOC','Viên',52000.00),(12,'Doxycycline 50mg','Respicure 50mg',10,100,'THUOC','Viên',5000.00),(13,'Doxycycline 100mg','Respicure 100mg',60,100,'THUOC','Viên',7000.00),(14,'Oxytetracycline + TMP + Sulfa','O.T.C',20,100,'THUOC','Viên',5000.00),(15,'Clindamycin 150mg','Goclin 150mg',6,100,'THUOC','Viên',15000.00),(16,'Lincomycin + Spectinomycin','Lincospectina',10,100,'THUOC','Viên',5000.00),(17,'Metronidazole 250mg','Metronidazole 250mg',500,100,'THUOC','Viên',5000.00),(18,'Clioquinol + KS hỗn hợp','Halquino 2 (cao cấp)',40,100,'THUOC','Viên',27000.00),(19,'Firocoxib 57mg','Previcox 57mg',10,100,'THUOC','Viên',28000.00),(20,'Meloxicam 2,5mg','Inflacam 2.5 mg (cao cấp)',100,100,'THUOC','Viên',17000.00),(21,'Tolfenamic Acid 6mg','Tofamate Tab 6',10,100,'THUOC','Viên',15000.00),(22,'Alpha-Chymotrypsin','Alphachymotrypsin',20,100,'THUOC','Viên',5000.00),(23,'Oclacitinib 3,6mg','Apoquel 3,6mg',100,100,'THUOC','Viên',40000.00),(24,'Oclacitinib 5,4mg','Apoquel 5,4mg',100,100,'THUOC','Viên',60000.00),(25,'Oclacitinib 16mg','Apoquel 16mg',100,100,'THUOC','Viên',100000.00),(26,'Itraconazole 100mg','Itra tab chó 100mg',30,100,'THUOC','Viên',18000.00),(27,'Itraconazole 25mg','Itra tab chó 25mg',30,100,'THUOC','Viên',10000.00),(28,'Itraconazole 25mg','Itra tab mèo 25mg',30,100,'THUOC','Viên',10000.00),(29,'Pimobendan','Cardisure Flavoured',100,100,'THUOC','Viên',40000.00),(30,'Fenbendazole + Pyrantel + Prazi','Caniverm forte tables 100x0.7g',100,100,'THUOC','Viên',50000.00),(31,'Mebendazole + Praziquantel','Caniverm mite tables 100x0.175g',100,100,'THUOC','Viên',50000.00),(32,'Milbemycin + Praziquantel','Milpro cho chó con (0,5kg - 5kg)',4,100,'THUOC','Viên',100000.00),(33,'Milbemycin + Praziquantel','Milpro cho chó (5kg - 25kg)',4,100,'THUOC','Viên',100000.00),(34,'Milbemycin + Praziquantel','Milpro cho mèo con (0,5kg - 2kg)',4,100,'THUOC','Viên',100000.00),(35,'Milbemycin + Praziquantel','Milpro cho mèo (2kg - 8kg)',4,100,'THUOC','Viên',100000.00),(36,'Pyrantel + Praziquantel','Kick tap - Cat',10,100,'THUOC','Viên',50000.00),(37,'Pyrantel + Praziquantel','Kick tape - Dog',10,100,'THUOC','Viên',50000.00),(38,'Pyrantel + Praziquantel','Kick tape - Dog S',10,100,'THUOC','Viên',50000.00),(39,'Febantel + Pyrantel + Prazi','Femitel 12 - 30mg (thông dụng)',6,100,'THUOC','Viên',50000.00),(40,'Febantel + Pyrantel + Prazi','Femitel 4 - 10mg (thông dụng)',6,100,'THUOC','Viên',50000.00),(41,'Fenbendazole + Praziquantel','Vime Deworm',10,100,'THUOC','Viên',50000.00),(42,NULL,'Áo mổ giấy',1,100,'VAT_TU','Chiếc',35000.00),(43,NULL,'Băng chun 2.5cm',1,100,'VAT_TU','Cuộn',15000.00),(44,NULL,'Băng chun 3 móc',1,100,'VAT_TU','Cuộn',30000.00),(45,NULL,'Băng chun 5cm',1,100,'VAT_TU','Cuộn',20000.00),(46,NULL,'Băng chun 7.5cm',1,100,'VAT_TU','Cuộn',25000.00),(47,NULL,'Băng keo Urgo 5cm',1,100,'VAT_TU','Cuộn',35000.00),(48,NULL,'Băng keo y tế 3M 2.5cm - Hộp 12 cuộn',1,100,'VAT_TU','Cuộn',40000.00),(49,NULL,'Băng keo y tế 3M 5cm - Hộp 6 cuộn',1,100,'VAT_TU','Cuộn',65000.00),(50,NULL,'Bộ dây truyền dịch',1,100,'VAT_TU','Chiếc',10000.00),(51,NULL,'Bộ kim cánh bướm G22',1,100,'VAT_TU','Chiếc',5000.00),(52,NULL,'Bơm tiêm 1ml',1,100,'VAT_TU','Chiếc',5000.00),(53,NULL,'Bơm tiêm 3ml',1,100,'VAT_TU','Chiếc',5000.00),(54,NULL,'Bơm tiêm 5ml',1,100,'VAT_TU','Chiếc',5000.00),(55,NULL,'Bơm tiêm 10ml',1,100,'VAT_TU','Chiếc',15000.00),(56,NULL,'Bơm tiêm 20ml',1,100,'VAT_TU','Chiếc',20000.00),(57,NULL,'Bơm tiêm 50ml',1,100,'VAT_TU','Chiếc',25000.00),(58,NULL,'Bông Bạch Tuyết (túi 10g)',1,100,'VAT_TU','Túi',25000.00),(59,NULL,'Bột bó thạch cao',1,100,'VAT_TU','Cuộn',20000.00),(60,NULL,'Bột cầm máu Showqueen',1,100,'VAT_TU','lọ',100000.00),(61,NULL,'Chỉ Catgut 0',1,100,'VAT_TU','Sợi',20000.00),(62,NULL,'Chỉ Catgut 1',1,100,'VAT_TU','Sợi',15000.00),(63,NULL,'Chỉ Catgut 2/0',1,100,'VAT_TU','Sợi',15000.00),(64,NULL,'Chỉ Catgut 3/0',1,100,'VAT_TU','Sợi',15000.00),(65,NULL,'Chỉ Catgut 5/0',1,100,'VAT_TU','Sợi',20000.00),(66,NULL,'Chỉ Nylon 0',1,100,'VAT_TU','Sợi',15000.00),(67,NULL,'Chỉ Nylon 2/0',1,100,'VAT_TU','Sợi',15000.00),(68,NULL,'Chỉ Nylon 3',1,100,'VAT_TU','Sợi',15000.00),(69,NULL,'Chỉ Nylon 3/0',1,100,'VAT_TU','Sợi',15000.00),(70,NULL,'Chỉ Polyglycolic Acid 0',1,100,'VAT_TU','Sợi',30000.00),(71,NULL,'Chỉ Polyglycolic Acid 1',1,100,'VAT_TU','Sợi',30000.00),(72,NULL,'Chỉ Polyglycolic Acid 2/0',1,100,'VAT_TU','Sợi',30000.00),(73,NULL,'Chỉ Polyglycolic Acid 3/0',1,100,'VAT_TU','Sợi',30000.00),(74,NULL,'Chỉ Polyglycolic Acid 4/0',1,100,'VAT_TU','Sợi',30000.00),(75,NULL,'Chỉ Silk Braided 2/0',1,100,'VAT_TU','Sợi',20000.00),(76,NULL,'Chỉ Silk Braided 3/0',1,100,'VAT_TU','Sợi',20000.00),(77,NULL,'Chỉ thép cuộn',1,100,'VAT_TU','Cuộn',210000.00),(78,NULL,'Cồn 70 Độ 100ml',1,100,'VAT_TU','Chai',30000.00),(79,NULL,'Đè lưỡi gỗ',1,100,'VAT_TU','chiếc',5000.00),(80,NULL,'Gạc cuộn 0,1m*2m',1,100,'VAT_TU','Cuộn',20000.00),(81,NULL,'Gạc vô trùng 10x10x8L',1,100,'VAT_TU','Chiếc',15000.00),(82,NULL,'Găng tay Phẫu thuật',1,100,'VAT_TU','Đôi',20000.00),(83,NULL,'Găng tay y tế có bột size M',1,100,'VAT_TU','Chiếc',5000.00),(84,NULL,'Găng tay y tế có bột size S',1,100,'VAT_TU','Chiếc',5000.00),(85,NULL,'Găng tay y tế không bột size M',1,100,'VAT_TU','Chiếc',5000.00),(86,NULL,'Găng tay y tế không bột size S',1,100,'VAT_TU','Chiếc',5000.00),(87,NULL,'Iodine 60ml',1,100,'VAT_TU','chai',35000.00),(88,NULL,'Khẩu trang y tế',1,100,'VAT_TU','Chiếc',7000.00),(89,NULL,'Kim bướm G23',1,100,'VAT_TU','Chiếc',5000.00),(90,NULL,'Kim bướm G25',1,100,'VAT_TU','Chiếc',5000.00),(91,NULL,'Kim châm cứu',1,100,'VAT_TU','Chiếc',5000.00),(92,NULL,'Kim luồn tím 26G',1,100,'VAT_TU','Chiếc',10000.00),(93,NULL,'Kim luồn vàng 24G',1,100,'VAT_TU','Chiếc',10000.00),(94,NULL,'Kim luồn xanh 22G',1,100,'VAT_TU','Chiếc',10000.00),(95,NULL,'Kim sắt 7',1,100,'VAT_TU','Chiếc',5000.00),(96,NULL,'Lót vệ sinh Dono - bịch 100 miếng',1,100,'VAT_TU','chiếc',5000.00),(97,NULL,'Lót vệ sinh Dono - bịch 50 miếng',1,100,'VAT_TU','chiếc',5000.00),(98,NULL,'Lưỡi dao mổ 15 Kiato',1,100,'VAT_TU','Chiếc',5000.00),(99,NULL,'Lưỡi dao mổ 20 Kiato',1,100,'VAT_TU','Chiếc',5000.00),(100,NULL,'Miếng dán phẫu thuật 5*7cm',1,100,'VAT_TU','Chiếc',5000.00),(101,NULL,'Miếng dán phẫu thuật 6*9cm',1,100,'VAT_TU','Chiếc',5000.00),(102,NULL,'Miếng dán phẫu thuật 9*10cm',1,100,'VAT_TU','Chiếc',5000.00),(103,NULL,'Mũ giấy',1,100,'VAT_TU','Chiếc',5000.00),(104,NULL,'Nước tự cứng Duracryl',1,100,'VAT_TU','Chai',286000.00),(105,NULL,'Ống hút dịch',1,100,'VAT_TU','Chiếc',10000.00),(106,NULL,'Ống nội khí quản 2.0',1,100,'VAT_TU','Chiếc',50000.00),(107,NULL,'Ống nội khí quản 2.5',1,100,'VAT_TU','Chiếc',50000.00),(108,NULL,'Ống nội khí quản 3.0',1,100,'VAT_TU','Chiếc',50000.00),(109,NULL,'Ống nội khí quản 3.5',1,100,'VAT_TU','Chiếc',50000.00),(110,NULL,'Ống nội khí quản 4.0',1,100,'VAT_TU','Chiếc',50000.00),(111,NULL,'Ống nội khí quản 4.5',1,100,'VAT_TU','Chiếc',50000.00),(112,NULL,'Ống nội khí quản 5.0',1,100,'VAT_TU','Chiếc',50000.00),(113,NULL,'Ống Sonde dạ dày',1,100,'VAT_TU','Chiếc',50000.00),(114,NULL,'Oxy già 10ml',1,100,'VAT_TU','chai',10000.00),(115,NULL,'Săng mổ Phúc Hà 60x80 cm',1,100,'VAT_TU','Chiếc',20000.00),(116,NULL,'Tăm bông vô trùng',1,100,'VAT_TU','Chiếc',10000.00),(117,NULL,'Tấm trải Nylon VT',1,100,'VAT_TU','Chiếc',20000.00),(118,NULL,'Thuốc bột cản quang Bari Sulfal',1,100,'VAT_TU','Gói',100000.00),(119,NULL,'Thuốc sát trùng CloraminB',1,100,'VAT_TU','Kg',200000.00);
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_species`
--

DROP TABLE IF EXISTS `medicine_species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_species` (
  `medicine_id` bigint NOT NULL,
  `species_id` bigint NOT NULL,
  PRIMARY KEY (`medicine_id`,`species_id`),
  KEY `FKbslepvxiqyddhge9clbq3j6e1` (`species_id`),
  CONSTRAINT `FKbslepvxiqyddhge9clbq3j6e1` FOREIGN KEY (`species_id`) REFERENCES `pet_species` (`id`),
  CONSTRAINT `FKd6auy9ayv66ektvfltx6vm245` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_species`
--

LOCK TABLES `medicine_species` WRITE;
/*!40000 ALTER TABLE `medicine_species` DISABLE KEYS */;
INSERT INTO `medicine_species` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(27,1),(29,1),(30,1),(31,1),(32,1),(33,1),(37,1),(38,1),(39,1),(40,1),(41,1),(42,1),(43,1),(44,1),(45,1),(46,1),(47,1),(48,1),(49,1),(50,1),(51,1),(52,1),(53,1),(54,1),(55,1),(56,1),(57,1),(58,1),(59,1),(60,1),(61,1),(62,1),(63,1),(64,1),(65,1),(66,1),(67,1),(68,1),(69,1),(70,1),(71,1),(72,1),(73,1),(74,1),(75,1),(76,1),(77,1),(78,1),(79,1),(80,1),(81,1),(82,1),(83,1),(84,1),(85,1),(86,1),(87,1),(88,1),(89,1),(90,1),(91,1),(92,1),(93,1),(94,1),(95,1),(96,1),(97,1),(98,1),(99,1),(100,1),(101,1),(102,1),(103,1),(104,1),(105,1),(106,1),(107,1),(108,1),(109,1),(110,1),(111,1),(112,1),(113,1),(114,1),(115,1),(116,1),(117,1),(118,1),(119,1),(1,2),(2,2),(3,2),(12,2),(14,2),(15,2),(17,2),(18,2),(21,2),(28,2),(34,2),(35,2),(36,2),(41,2),(42,2),(43,2),(44,2),(45,2),(46,2),(47,2),(48,2),(49,2),(50,2),(51,2),(52,2),(53,2),(54,2),(55,2),(56,2),(57,2),(58,2),(59,2),(60,2),(61,2),(62,2),(63,2),(64,2),(65,2),(66,2),(67,2),(68,2),(69,2),(70,2),(71,2),(72,2),(73,2),(74,2),(75,2),(76,2),(77,2),(78,2),(79,2),(80,2),(81,2),(82,2),(83,2),(84,2),(85,2),(86,2),(87,2),(88,2),(89,2),(90,2),(91,2),(92,2),(93,2),(94,2),(95,2),(96,2),(97,2),(98,2),(99,2),(100,2),(101,2),(102,2),(103,2),(104,2),(105,2),(106,2),(107,2),(108,2),(109,2),(110,2),(111,2),(112,2),(113,2),(114,2),(115,2),(116,2),(117,2),(118,2),(119,2);
/*!40000 ALTER TABLE `medicine_species` ENABLE KEYS */;
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
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `target_role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_user_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-04-19 15:59:01.912170',_binary '','/doctors/tickets/5','Bạn được phân công một phiếu tiếp nhận mới cho thú cưng Tom',NULL,1,'Phiếu tiếp nhận mới','NEW_RECEPTION'),(2,'2026-04-19 16:10:59.075183',_binary '','/doctors/tickets/6','Bạn được phân công một phiếu tiếp nhận mới cho thú cưng Jack',NULL,1,'Phiếu tiếp nhận mới','NEW_RECEPTION'),(3,'2026-04-19 16:25:16.149495',_binary '','/doctors/tickets/7','Bạn được phân công một phiếu tiếp nhận mới cho thú cưng Mii',NULL,1,'Phiếu tiếp nhận mới','NEW_RECEPTION'),(4,'2026-04-19 16:42:22.054133',_binary '\0','/techs/record-result/1','Bạn được chỉ định thực hiện dịch vụ Dịch vụ CT scan vùng bụng cho Jack',NULL,15,'Phân công dịch vụ mới','TECH_ASSIGNMENT'),(5,'2026-04-19 16:44:03.949967',_binary '',NULL,'KTV đã cập nhật kết quả dịch vụ Dịch vụ CT scan vùng bụng cho thú cưng Jack',NULL,1,'Kết quả dịch vụ đã cập nhật','TECH_RESULT'),(6,'2026-04-19 17:06:14.102518',_binary '\0','/receptionists/payment/6','Bac si da hoan tat kham cho thu cung Jack. Vui long thu ngan.','RECEPTIONIST',NULL,'Ca kham cho thanh toan','WAITING_PAYMENT'),(7,'2026-04-19 17:14:46.027307',_binary '\0','/doctors/tickets/8','Bạn được phân công một phiếu tiếp nhận mới cho thú cưng Micky',NULL,1,'Phiếu tiếp nhận mới','NEW_RECEPTION'),(8,'2026-04-19 17:15:52.644395',_binary '\0','/techs/record-result/2','Bạn được chỉ định thực hiện dịch vụ Dịch vụ CT scan vùng ngực cho Mii',NULL,15,'Phân công dịch vụ mới','TECH_ASSIGNMENT'),(9,'2026-04-19 17:16:07.154942',_binary '\0','/techs/record-result/3','Bạn được chỉ định thực hiện dịch vụ Dịch vụ CT scan vùng cổ cho Mii',NULL,12,'Phân công dịch vụ mới','TECH_ASSIGNMENT'),(10,'2026-04-19 17:16:57.993056',_binary '\0',NULL,'KTV đã cập nhật kết quả dịch vụ Dịch vụ CT scan vùng ngực cho thú cưng Mii',NULL,1,'Kết quả dịch vụ đã cập nhật','TECH_RESULT'),(11,'2026-04-19 17:18:20.342990',_binary '\0',NULL,'KTV đã cập nhật kết quả dịch vụ Dịch vụ CT scan vùng cổ cho thú cưng Mii',NULL,1,'Kết quả dịch vụ đã cập nhật','TECH_RESULT'),(12,'2026-04-19 17:19:22.425451',_binary '\0','/receptionists/payment/7','Bac si da hoan tat kham cho thu cung Mii. Vui long thu ngan.','RECEPTIONIST',NULL,'Ca kham cho thanh toan','WAITING_PAYMENT'),(13,'2026-04-19 17:20:14.106148',_binary '\0','/receptionists/payment/6','Hoa don cua thu cung Jack da duoc thanh toan.','RECEPTIONIST',NULL,'Da thanh toan','PAID');
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
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `breed` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkr3ikmj59xajmfnnqh5ut5hqr` (`client_id`),
  CONSTRAINT `FKkr3ikmj59xajmfnnqh5ut5hqr` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet`
--

LOCK TABLES `pet` WRITE;
/*!40000 ALTER TABLE `pet` DISABLE KEYS */;
INSERT INTO `pet` VALUES (1,'Mèo Ba Tư','2026-02-03',NULL,'Tom','meo',1),(2,'Poodle','2026-03-29',NULL,'Jack','cho',2),(3,'Mèo Anh Lông Dài','2026-03-29',NULL,'Mii','meo',3),(4,'Mèo Anh Lông Dài','2026-03-01',NULL,'Micky','meo',4);
/*!40000 ALTER TABLE `pet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet_breeds`
--

DROP TABLE IF EXISTS `pet_breeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_breeds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  `species_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pet_breed_species_name` (`species_id`,`name`),
  KEY `idx_pet_breeds_species` (`species_id`),
  CONSTRAINT `FKvuath5k3rafi3kshqlgr8y8m` FOREIGN KEY (`species_id`) REFERENCES `pet_species` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet_breeds`
--

LOCK TABLES `pet_breeds` WRITE;
/*!40000 ALTER TABLE `pet_breeds` DISABLE KEYS */;
INSERT INTO `pet_breeds` VALUES (1,_binary '','Poodle',1,1),(2,_binary '','Corgi',2,1),(3,_binary '','Husky',3,1),(4,_binary '','Golden Retriever',4,1),(5,_binary '','Pug',5,1),(6,_binary '','Shiba',6,1),(7,_binary '','Chihuahua',7,1),(8,_binary '','Labrador',8,1),(9,_binary '','Phốc sóc (Pomeranian)',9,1),(10,_binary '','Becgie (German Shepherd)',10,1),(11,_binary '','Mèo Anh lông ngắn',1,2),(12,_binary '','Mèo Anh lông dài',2,2),(13,_binary '','Mèo Ba Tư',3,2),(14,_binary '','Mèo Xiêm',4,2),(15,_binary '','Mèo Bengal',5,2),(16,_binary '','Maine Coon',6,2),(17,_binary '','Scottish Fold',7,2),(18,_binary '','Munchkin',8,2),(19,_binary '','Mèo ta',9,2),(20,_binary '','Mèo Sphynx',10,2);
/*!40000 ALTER TABLE `pet_breeds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pet_species`
--

DROP TABLE IF EXISTS `pet_species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_species` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pet_species_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pet_species`
--

LOCK TABLES `pet_species` WRITE;
/*!40000 ALTER TABLE `pet_species` DISABLE KEYS */;
INSERT INTO `pet_species` VALUES (1,_binary '','cho','Chó',1),(2,_binary '','meo','Mèo',2);
/*!40000 ALTER TABLE `pet_species` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_result_id` bigint DEFAULT NULL,
  `medical_record_id` bigint DEFAULT NULL,
  `reception_service_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3kv530otd1sfv47dxljlpt7yu` (`reception_service_id`),
  KEY `FK5osmot4vbd3dc2fv7rn4gv3ng` (`exam_result_id`),
  KEY `FKf8hnlj7uxoroaf2mca0qyw4cx` (`medical_record_id`),
  CONSTRAINT `FK10qkkrs7fi4oay9vh9ex8ykrk` FOREIGN KEY (`reception_service_id`) REFERENCES `reception_services` (`id`),
  CONSTRAINT `FK5osmot4vbd3dc2fv7rn4gv3ng` FOREIGN KEY (`exam_result_id`) REFERENCES `exam_result` (`id`),
  CONSTRAINT `FKf8hnlj7uxoroaf2mca0qyw4cx` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES (1,1,6,4),(2,2,7,3),(3,2,7,6),(4,2,7,7);
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
  `dose_afternoon` decimal(6,2) DEFAULT NULL,
  `dosage_unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dose_evening` decimal(6,2) DEFAULT NULL,
  `instruction` text COLLATE utf8mb4_unicode_ci,
  `dose_morning` decimal(6,2) DEFAULT NULL,
  `dose_noon` decimal(6,2) DEFAULT NULL,
  `quantity` int NOT NULL,
  `medicine_id` bigint NOT NULL,
  `prescription_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKik2mm986ygebo4kq2kvl3hcdu` (`medicine_id`),
  KEY `FKdq2yagbksdomo6t1o1b8g3poe` (`prescription_id`),
  CONSTRAINT `FKdq2yagbksdomo6t1o1b8g3poe` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`id`),
  CONSTRAINT `FKik2mm986ygebo4kq2kvl3hcdu` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_detail`
--

LOCK TABLES `prescription_detail` WRITE;
/*!40000 ALTER TABLE `prescription_detail` DISABLE KEYS */;
INSERT INTO `prescription_detail` VALUES (1,1.00,'chiếc',1.00,NULL,1.00,1.00,1,42,1),(2,1.00,'cuộn',1.00,NULL,1.00,1.00,1,43,1),(3,1.00,'cuộn',1.00,NULL,1.00,1.00,1,44,1),(5,1.00,'chiếc',1.00,NULL,1.00,1.00,1,42,3),(6,1.00,'cuộn',1.00,NULL,1.00,1.00,1,43,3),(7,1.00,'cuộn',1.00,NULL,1.00,1.00,1,46,4),(8,1.00,'cuộn',1.00,NULL,1.00,1.00,1,47,4),(9,0.00,'viên',1.00,'Uống sau ăn',1.00,0.00,1,1,2),(10,0.00,'viên',1.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',1.00,0.00,1,25,2);
/*!40000 ALTER TABLE `prescription_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_recommendation`
--

DROP TABLE IF EXISTS `prescription_recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_recommendation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dosage_unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dose_afternoon` decimal(6,2) NOT NULL,
  `dose_evening` decimal(6,2) NOT NULL,
  `dose_morning` decimal(6,2) NOT NULL,
  `dose_noon` decimal(6,2) NOT NULL,
  `instruction` text COLLATE utf8mb4_unicode_ci,
  `max_weight` decimal(6,2) DEFAULT NULL,
  `min_weight` decimal(6,2) DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `treatment_days` int NOT NULL,
  `medicine_id` bigint NOT NULL,
  `species_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prescription_recommendation_filter` (`medicine_id`,`species_id`,`min_weight`,`max_weight`),
  KEY `FKsf5nqpg90uiybny3qf1caf2fd` (`species_id`),
  CONSTRAINT `FKlnkvo9xe87wlircjxss99hio8` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`id`),
  CONSTRAINT `FKsf5nqpg90uiybny3qf1caf2fd` FOREIGN KEY (`species_id`) REFERENCES `pet_species` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=390 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_recommendation`
--

LOCK TABLES `prescription_recommendation` WRITE;
/*!40000 ALTER TABLE `prescription_recommendation` DISABLE KEYS */;
INSERT INTO `prescription_recommendation` VALUES (80,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',2.50,0.00,0.00,0,1,1),(81,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,2.50,0.00,0,1,1),(82,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,1,2),(83,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. 10mg/kg/lần',5.00,0.00,0.00,0,2,1),(84,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,2,1),(85,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,2,1),(86,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,2,2),(87,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. 30mg/kg/lần',5.00,0.00,0.00,0,3,1),(88,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,3,1),(89,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,3,1),(90,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,3,2),(91,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. KHÔNG dùng chó con đang lớn',5.00,0.00,0.00,0,4,1),(92,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,4,1),(93,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,4,1),(94,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,5,1),(95,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,5,1),(96,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,6,1),(97,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,6,1),(98,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. 3mg/kg/lần',5.00,2.50,0.00,0,7,1),(99,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,8,1),(100,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',10.50,6.50,0.00,0,9,1),(101,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',21.00,17.10,0.00,0,10,1),(102,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',20.00,10.00,0.00,0,11,1),(103,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,12,1),(104,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,12,1),(105,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,12,2),(106,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,0.00,0.00,0,13,1),(107,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,13,1),(108,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,1),(109,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn. Uống nhiều nước',10.00,5.00,0.00,0,14,1),(110,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,2),(111,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,15,1),(112,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,15,1),(113,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. Dùng Toxoplasma',5.00,0.00,0.00,0,15,2),(114,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,16,1),(115,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,16,1),(116,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,1),(117,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,17,1),(118,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,17,1),(119,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,2),(120,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,1),(121,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,2),(122,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. CHỈ cho chó',5.00,0.00,0.00,0,19,1),(123,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',11.50,5.00,0.00,0,19,1),(124,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',23.00,11.50,0.00,0,19,1),(125,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Ngày 1: liều kép',5.00,0.00,0.00,0,20,1),(126,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,20,1),(127,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,20,1),(128,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày liên tục',3.00,0.00,0.00,0,21,1),(129,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,1),(130,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày',3.00,0.00,0.00,0,21,2),(131,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,2),(132,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Tiêu phù nề',5.00,0.00,0.00,0,22,1),(133,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,22,1),(134,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Chó ≥ 12 tháng. Duy trì: chỉ 1 viên sáng',10.00,3.00,0.00,0,23,1),(135,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',22.00,10.00,0.00,0,24,1),(136,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',55.00,22.00,0.00,0,25,1),(137,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn no',10.00,5.00,0.00,0,26,1),(138,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',20.00,10.00,0.00,0,26,1),(139,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,2.00,0.00,0,27,1),(140,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,0.00,0.00,0,28,2),(141,'Viên',0.00,0.50,0.50,0.00,'⚠ Uống TRƯỚC ăn 1 giờ. Không được bỏ liều',5.00,0.00,0.00,0,29,1),(142,'Viên',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',10.00,5.00,0.00,0,29,1),(143,'Viên',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',20.00,10.00,0.00,0,29,1),(144,'Viên',0.00,0.00,0.25,0.00,'Uống lúc đói hoặc sau ăn',2.00,0.00,0.00,0,30,1),(145,'Viên',0.00,0.00,0.50,0.00,'Uống lúc đói hoặc sau ăn',5.00,2.00,0.00,0,30,1),(146,'Viên',0.00,0.00,1.00,0.00,NULL,10.00,5.00,0.00,0,30,1),(147,'Viên',0.00,0.00,2.00,0.00,NULL,20.00,10.00,0.00,0,30,1),(148,'Viên',0.00,0.00,0.50,0.00,'Phù hợp chó con/nhỏ',2.00,0.00,0.00,0,31,1),(149,'Viên',0.00,0.00,1.00,0.00,NULL,5.00,2.00,0.00,0,31,1),(150,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,36,2),(151,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,37,1),(152,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,37,1),(153,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,1),(154,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,1),(155,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,2),(156,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,2),(236,'< 2,5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',2.50,0.00,0.00,0,1,1),(237,'2,5 – 5 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,2.50,0.00,0,1,1),(238,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,1,2),(239,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn. 10mg/kg/lần',5.00,0.00,0.00,0,2,1),(240,'5 – 10 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,2,1),(241,'10 – 20 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,2,1),(242,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,2,2),(243,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn. 30mg/kg/lần',5.00,0.00,0.00,0,3,1),(244,'5 – 10 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,3,1),(245,'10 – 20 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,3,1),(246,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,3,2),(247,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn. KHÔNG dùng chó con đang lớn',5.00,0.00,0.00,0,4,1),(248,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,4,1),(249,'10 – 20 kg',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,4,1),(250,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,5,1),(251,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,5,1),(252,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,6,1),(253,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,6,1),(254,'2,5 – 5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn. 3mg/kg/lần',5.00,2.50,0.00,0,7,1),(255,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,8,1),(256,'6,5 – 10,5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',10.50,6.50,0.00,0,9,1),(257,'17,1 – 21 kg',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',21.00,17.10,0.00,0,10,1),(258,'10 – 20 kg',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',20.00,10.00,0.00,0,11,1),(259,'< 5 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,12,1),(260,'5 – 10 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,12,1),(261,'Mọi cân',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,12,2),(262,'< 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,0.00,0.00,0,13,1),(263,'10 – 20 kg',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,13,1),(264,'< 5 kg',0.00,1.00,1.00,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,1),(265,'5 – 10 kg',0.00,2.00,2.00,0.00,'Uống sau ăn. Uống nhiều nước',10.00,5.00,0.00,0,14,1),(266,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,2),(267,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,15,1),(268,'5 – 10 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,15,1),(269,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn. Dùng Toxoplasma',5.00,0.00,0.00,0,15,2),(270,'< 5 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,16,1),(271,'5 – 10 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,16,1),(272,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,1),(273,'5 – 10 kg',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,17,1),(274,'10 – 20 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,17,1),(275,'< 5 kg',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,2),(276,'Mọi cân',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,1),(277,'Mọi cân',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,2),(278,'< 5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn. CHỈ cho chó',5.00,0.00,0.00,0,19,1),(279,'5 – 11,5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',11.50,5.00,0.00,0,19,1),(280,'11,5 – 23 kg',0.00,0.00,2.00,0.00,'Uống sau ăn',23.00,11.50,0.00,0,19,1),(281,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn. Ngày 1: liều kép',5.00,0.00,0.00,0,20,1),(282,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,20,1),(283,'10 – 20 kg',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,20,1),(284,'< 3 kg',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày liên tục',3.00,0.00,0.00,0,21,1),(285,'3 – 6 kg',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,1),(286,'< 3 kg',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày',3.00,0.00,0.00,0,21,2),(287,'3 – 6 kg',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,2),(288,'< 5 kg',0.00,1.00,1.00,0.00,'Uống sau ăn. Tiêu phù nề',5.00,0.00,0.00,0,22,1),(289,'5 – 20 kg',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,22,1),(290,'3 – 10 kg',0.00,1.00,1.00,0.00,'Uống sau ăn. Chó ≥ 12 tháng. Duy trì: chỉ 1 viên sáng',10.00,3.00,0.00,0,23,1),(291,'10 – 22 kg',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',22.00,10.00,0.00,0,24,1),(292,'22 – 55 kg',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',55.00,22.00,0.00,0,25,1),(293,'5 – 10 kg',0.00,0.00,0.50,0.00,'Uống sau ăn no',10.00,5.00,0.00,0,26,1),(294,'10 – 20 kg',0.00,0.00,1.00,0.00,'Uống sau ăn no',20.00,10.00,0.00,0,26,1),(295,'2 – 5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,2.00,0.00,0,27,1),(296,'< 5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,0.00,0.00,0,28,2),(297,'< 5 kg',0.00,0.50,0.50,0.00,'⚠ Uống TRƯỚC ăn 1 giờ. Không được bỏ liều',5.00,0.00,0.00,0,29,1),(298,'5 – 10 kg',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',10.00,5.00,0.00,0,29,1),(299,'10 – 20 kg',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',20.00,10.00,0.00,0,29,1),(300,'< 2 kg',0.00,0.00,0.25,0.00,'Uống lúc đói hoặc sau ăn',2.00,0.00,0.00,0,30,1),(301,'2 – 5 kg',0.00,0.00,0.50,0.00,'Uống lúc đói hoặc sau ăn',5.00,2.00,0.00,0,30,1),(302,'5 – 10 kg',0.00,0.00,1.00,0.00,NULL,10.00,5.00,0.00,0,30,1),(303,'10 – 20 kg',0.00,0.00,2.00,0.00,NULL,20.00,10.00,0.00,0,30,1),(304,'< 2 kg',0.00,0.00,0.50,0.00,'Phù hợp chó con/nhỏ',2.00,0.00,0.00,0,31,1),(305,'2 – 5 kg',0.00,0.00,1.00,0.00,NULL,5.00,2.00,0.00,0,31,1),(306,'Mọi cân',0.00,0.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,36,2),(307,'5 – 20 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,37,1),(308,'< 5 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,37,1),(309,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,1),(310,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,1),(311,'< 5 kg',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,2),(312,'5 – 10 kg',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,2),(313,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',2.50,0.00,0.00,0,1,1),(314,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,2.50,0.00,0,1,1),(315,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,1,2),(316,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. 10mg/kg/lần',5.00,0.00,0.00,0,2,1),(317,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,2,1),(318,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,2,1),(319,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,2,2),(320,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. 30mg/kg/lần',5.00,0.00,0.00,0,3,1),(321,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,3,1),(322,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,3,1),(323,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,3,2),(324,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. KHÔNG dùng chó con đang lớn',5.00,0.00,0.00,0,4,1),(325,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,4,1),(326,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,4,1),(327,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,5,1),(328,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,5,1),(329,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,6,1),(330,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,6,1),(331,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. 3mg/kg/lần',5.00,2.50,0.00,0,7,1),(332,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,8,1),(333,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',10.50,6.50,0.00,0,9,1),(334,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',21.00,17.10,0.00,0,10,1),(335,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn, uống nhiều nước',20.00,10.00,0.00,0,11,1),(336,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,12,1),(337,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,12,1),(338,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,12,2),(339,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,0.00,0.00,0,13,1),(340,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,13,1),(341,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,1),(342,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn. Uống nhiều nước',10.00,5.00,0.00,0,14,1),(343,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. Uống nhiều nước',5.00,0.00,0.00,0,14,2),(344,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,15,1),(345,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,15,1),(346,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn. Dùng Toxoplasma',5.00,0.00,0.00,0,15,2),(347,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,16,1),(348,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,16,1),(349,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,1),(350,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,17,1),(351,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,17,1),(352,'Viên',0.00,0.50,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,17,2),(353,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,1),(354,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,18,2),(355,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. CHỈ cho chó',5.00,0.00,0.00,0,19,1),(356,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',11.50,5.00,0.00,0,19,1),(357,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',23.00,11.50,0.00,0,19,1),(358,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Ngày 1: liều kép',5.00,0.00,0.00,0,20,1),(359,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,20,1),(360,'Viên',0.00,0.00,2.00,0.00,'Uống sau ăn',20.00,10.00,0.00,0,20,1),(361,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày liên tục',3.00,0.00,0.00,0,21,1),(362,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,1),(363,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn. Tối đa 3 ngày',3.00,0.00,0.00,0,21,2),(364,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn. Tối đa 3 ngày',6.00,3.00,0.00,0,21,2),(365,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Tiêu phù nề',5.00,0.00,0.00,0,22,1),(366,'Viên',0.00,2.00,2.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,22,1),(367,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Chó ≥ 12 tháng. Duy trì: chỉ 1 viên sáng',10.00,3.00,0.00,0,23,1),(368,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',22.00,10.00,0.00,0,24,1),(369,'Viên',0.00,1.00,1.00,0.00,'Uống sau ăn. Duy trì: chỉ 1 viên sáng',55.00,22.00,0.00,0,25,1),(370,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn no',10.00,5.00,0.00,0,26,1),(371,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',20.00,10.00,0.00,0,26,1),(372,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,2.00,0.00,0,27,1),(373,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn no',5.00,0.00,0.00,0,28,2),(374,'Viên',0.00,0.50,0.50,0.00,'⚠ Uống TRƯỚC ăn 1 giờ. Không được bỏ liều',5.00,0.00,0.00,0,29,1),(375,'Viên',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',10.00,5.00,0.00,0,29,1),(376,'Viên',0.00,1.00,1.00,0.00,'⚠ Uống TRƯỚC ăn 1 giờ',20.00,10.00,0.00,0,29,1),(377,'Viên',0.00,0.00,0.25,0.00,'Uống lúc đói hoặc sau ăn',2.00,0.00,0.00,0,30,1),(378,'Viên',0.00,0.00,0.50,0.00,'Uống lúc đói hoặc sau ăn',5.00,2.00,0.00,0,30,1),(379,'Viên',0.00,0.00,1.00,0.00,NULL,10.00,5.00,0.00,0,30,1),(380,'Viên',0.00,0.00,2.00,0.00,NULL,20.00,10.00,0.00,0,30,1),(381,'Viên',0.00,0.00,0.50,0.00,'Phù hợp chó con/nhỏ',2.00,0.00,0.00,0,31,1),(382,'Viên',0.00,0.00,1.00,0.00,NULL,5.00,2.00,0.00,0,31,1),(383,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',9999.00,0.00,0.00,0,36,2),(384,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',20.00,5.00,0.00,0,37,1),(385,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',5.00,0.00,0.00,0,37,1),(386,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,1),(387,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,1),(388,'Viên',0.00,0.00,0.50,0.00,'Uống sau ăn',5.00,0.00,0.00,0,41,2),(389,'Viên',0.00,0.00,1.00,0.00,'Uống sau ăn',10.00,5.00,0.00,0,41,2);
/*!40000 ALTER TABLE `prescription_recommendation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reception_record`
--

DROP TABLE IF EXISTS `reception_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reception_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `emergency` bit(1) NOT NULL,
  `exam_reason` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `reception_time` datetime(6) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `client_id` bigint NOT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `exam_type_option_id` bigint DEFAULT NULL,
  `pet_id` bigint NOT NULL,
  `receptionist_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKanax2357qa8r0wuwk0w9j8n5v` (`client_id`),
  KEY `FKgt9yam647xtdgh3g4w4p64bqn` (`doctor_id`),
  KEY `FKknr62fax906yl2o7o1n9u1wwg` (`exam_type_option_id`),
  KEY `FKd29w9d1hyn1nfmrrr1lt4aa67` (`pet_id`),
  KEY `FKaglxrbc2ai4481niabn1gajnk` (`receptionist_id`),
  CONSTRAINT `FKaglxrbc2ai4481niabn1gajnk` FOREIGN KEY (`receptionist_id`) REFERENCES `receptionist` (`id`),
  CONSTRAINT `FKanax2357qa8r0wuwk0w9j8n5v` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `FKd29w9d1hyn1nfmrrr1lt4aa67` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`id`),
  CONSTRAINT `FKgt9yam647xtdgh3g4w4p64bqn` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`),
  CONSTRAINT `FKknr62fax906yl2o7o1n9u1wwg` FOREIGN KEY (`exam_type_option_id`) REFERENCES `exam_type_options` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_record`
--

LOCK TABLES `reception_record` WRITE;
/*!40000 ALTER TABLE `reception_record` DISABLE KEYS */;
INSERT INTO `reception_record` VALUES (5,_binary '','Viêm da','Khách khó tính','2026-04-19 15:59:01.709042','đang thực hiện',5.00,1,1,1,1,6),(6,_binary '\0','Biếng ăn','','2026-04-19 16:10:59.057933','đã thanh toán',3.00,2,1,1,2,6),(7,_binary '\0','Viêm da','Mèo nhát','2026-04-19 16:25:16.132917','chờ thanh toán',2.00,3,1,1,3,6),(8,_binary '\0','Viêm da','','2026-04-19 17:14:46.002655','chờ thực hiện',3.00,4,1,1,4,6);
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
  `status` enum('COMPLETED','IN_PROGRESS','PENDING') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reception_record_id` bigint NOT NULL,
  `service_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2a574tm00ontq3223tsp4hon7` (`reception_record_id`,`service_id`),
  KEY `FK44d2a1y1whpjf9msrxnvek7jc` (`service_id`),
  CONSTRAINT `FK44d2a1y1whpjf9msrxnvek7jc` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  CONSTRAINT `FK9kw61t8c15wk87g6uw6r3sayx` FOREIGN KEY (`reception_record_id`) REFERENCES `reception_record` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reception_services`
--

LOCK TABLES `reception_services` WRITE;
/*!40000 ALTER TABLE `reception_services` DISABLE KEYS */;
INSERT INTO `reception_services` VALUES (1,'2026-04-19 15:59:01.724857','2026-04-19 16:11:21.892904','IN_PROGRESS',5,1),(2,'2026-04-19 16:10:59.072775','2026-04-19 16:25:56.282525','COMPLETED',6,1),(3,'2026-04-19 16:25:16.147070','2026-04-19 17:15:06.477956','COMPLETED',7,1),(4,'2026-04-19 16:42:22.057848','2026-04-19 16:43:20.557065','COMPLETED',6,133),(5,'2026-04-19 17:14:46.023160',NULL,'PENDING',8,1),(6,'2026-04-19 17:15:52.647688','2026-04-19 17:16:35.312609','COMPLETED',7,136),(7,'2026-04-19 17:16:07.158398','2026-04-19 17:18:02.899549','COMPLETED',7,135);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
-- Table structure for table `result_files`
--

DROP TABLE IF EXISTS `result_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `result_files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `original_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exam_result_id` bigint DEFAULT NULL,
  `service_result_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_result_files_exam_result` (`exam_result_id`),
  KEY `idx_result_files_service_result` (`service_result_id`),
  CONSTRAINT `FKo3qhs64evwggjpo5fu7otwqoh` FOREIGN KEY (`exam_result_id`) REFERENCES `exam_result` (`id`),
  CONSTRAINT `FKrngyp7iy9r3dhulnbmtvmdimc` FOREIGN KEY (`service_result_id`) REFERENCES `service_result` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result_files`
--

LOCK TABLES `result_files` WRITE;
/*!40000 ALTER TABLE `result_files` DISABLE KEYS */;
INSERT INTO `result_files` VALUES (1,'image/jpeg','2026-04-19 16:26:32.962029','./storage/exam-results/exam-result-1776615992945-faf54897-9351-4ce8-9b7f-3512981ff320.jpg',192585,'meo-bi-viem-da-4.jpg',1,NULL),(2,'image/jpeg','2026-04-19 16:44:03.864834','./storage/tech-results/tech-result-1776617043862-ee3cc638-6fd6-4581-92f7-cd02b661f5f9.jpg',192585,'meo-bi-viem-da-4.jpg',NULL,1),(3,'image/jpeg','2026-04-19 17:15:38.064957','./storage/exam-results/exam-result-1776618938060-dae8bc74-7ecf-4d18-be18-199856a750f7.jpg',192585,'meo-bi-viem-da-4.jpg',2,NULL),(4,'image/jpeg','2026-04-19 17:16:57.933510','./storage/tech-results/tech-result-1776619017931-9ff5fe0b-a27f-41ef-ad75-86630cffccac.jpg',236379,'viemda.jpg',NULL,2),(5,'image/jpeg','2026-04-19 17:18:20.312226','./storage/tech-results/tech-result-1776619100311-440bb238-ee7f-4fa7-89fa-75c040e45609.jpg',236379,'viemda.jpg',NULL,3);
/*!40000 ALTER TABLE `result_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_order`
--

LOCK TABLES `service_order` WRITE;
/*!40000 ALTER TABLE `service_order` DISABLE KEYS */;
INSERT INTO `service_order` VALUES (1,6,133,15),(2,7,136,15),(3,7,135,12);
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
  `evidence_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result` text COLLATE utf8mb4_unicode_ci,
  `start_time` datetime(6) DEFAULT NULL,
  `service_order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd665vrsc01na9tq9vllcm8f5x` (`service_order_id`),
  CONSTRAINT `FKpk62h5pa1wa6ib2tiga4nr76t` FOREIGN KEY (`service_order_id`) REFERENCES `service_order` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_result`
--

LOCK TABLES `service_result` WRITE;
/*!40000 ALTER TABLE `service_result` DISABLE KEYS */;
INSERT INTO `service_result` VALUES (1,'2026-04-19 16:44:03.863926',NULL,'Có dị vật','2026-04-19 16:43:20.540299',1),(2,'2026-04-19 17:16:57.932855',NULL,'Test','2026-04-19 17:16:35.293116',2),(3,'2026-04-19 17:18:20.311905',NULL,'Tesst','2026-04-19 17:18:02.895230',3);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatment_direction`
--

LOCK TABLES `treatment_direction` WRITE;
/*!40000 ALTER TABLE `treatment_direction` DISABLE KEYS */;
INSERT INTO `treatment_direction` VALUES (1,'KhÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡m cÃƒÆ’Ã‚Â¡Ãƒâ€šÃ‚ÂºÃƒâ€šÃ‚Â­n lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢m sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â ng'),(2,'Khám cận lâm sàng'),(3,'Cho vÃƒÆ’Ã‚Â¡Ãƒâ€šÃ‚Â»Ãƒâ€šÃ‚Â');
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
  `plan` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `medical_record_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKliwbq6j1lgmnqwt92kmbu6w7s` (`created_by`),
  KEY `FK3jbso7abds31ogisavppxsqh` (`medical_record_id`),
  CONSTRAINT `FK3jbso7abds31ogisavppxsqh` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_record` (`id`),
  CONSTRAINT `FKliwbq6j1lgmnqwt92kmbu6w7s` FOREIGN KEY (`created_by`) REFERENCES `doctor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `avatar_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4bgmpi98dylab6qdvf9xyaxu4` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=553 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'./storage/Untitled.jpg','Nguyễn Minh Anh','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0901000000'),(2,'./storage/Untitled.jpg','Trần Quốc Bảo','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0901000001'),(3,'./storage/Untitled.jpg','Lê Thanh Huyền','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0901000002'),(4,'./storage/Untitled.jpg','Phạm Gia Hưng','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0901000003'),(5,'./storage/Untitled.jpg','Hoàng Ngọc Linh','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0901000004'),(6,'./storage/Untitled.jpg','Vũ Đức Anh','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0902000000'),(7,'./storage/Untitled.jpg','Đặng Quỳnh Chi','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0902000001'),(8,'./storage/Untitled.jpg','Bùi Tuấn Kiệt','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0902000002'),(9,'./storage/Untitled.jpg','Phan Thị Mai','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0902000003'),(10,'./storage/Untitled.jpg','Đỗ Nhật Nam','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0902000004'),(11,'./storage/Untitled.jpg','Hồ Khánh Vy','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0903000000'),(12,'./storage/Untitled.jpg','Trịnh Công Sơn','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0903000001'),(13,'./storage/Untitled.jpg','Nguyễn Hoài An','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0903000002'),(14,'./storage/Untitled.jpg','Lý Hải Đăng','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0903000003'),(15,'./storage/Untitled.jpg','Cao Minh Trí','$2a$12$urVmsfmqvoQmSpvFfn5z4e9Bl3hTqHwuKl7fgHHyfeHYfM5At4BV.','0903000004');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-20  0:35:20
