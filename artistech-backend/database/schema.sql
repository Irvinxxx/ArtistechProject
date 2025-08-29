-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: artistech_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `artistech_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `artistech_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `artistech_db`;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,6,'John Michael Roxas','09916572342','Kapalong Talaingod Street','Valencia','Bukidnon','8709','Philippines','Sugod',1,'2025-07-25 14:32:39','2025-07-25 14:32:39'),(2,13,'John Michael Roxas','09916572342','Kapalong Talaingod Street','Valencia','Bukidnon','8709','Philippines','Sugod',1,'2025-07-25 14:46:01','2025-07-25 14:46:01'),(3,15,'John Michael Roxas','09916572342','Kapalong Talaingod Street','Valencia','Bukidnon','8709','Philippines','Sugod',1,'2025-07-25 15:06:39','2025-07-25 15:06:39'),(4,18,'John Michael Roxas','09916572342','Kapalong Talaingod Street','Valencia','Bukidnon','8709','Philippines','Sugod',1,'2025-07-25 17:09:39','2025-07-25 17:09:39'),(5,21,'Fero','09196572342','Quezon','Quezon','Manila','1232','Philippines','Sa gilid ng may balutan',1,'2025-07-28 14:58:41','2025-07-28 14:58:41');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_detection_logs`
--

DROP TABLE IF EXISTS `ai_detection_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_detection_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artwork_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `detection_service` varchar(100) NOT NULL,
  `detection_result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detection_result`)),
  `is_ai_generated` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `artwork_id` (`artwork_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_detection_logs_ibfk_1` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ai_detection_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_detection_logs`
--

LOCK TABLES `ai_detection_logs` WRITE;
/*!40000 ALTER TABLE `ai_detection_logs` DISABLE KEYS */;
INSERT INTO `ai_detection_logs` VALUES (15,67,10,'hive.ai-vlm','{\n  \"id\": \"f383012d-73f7-11f0-b25c-c6a374569dca\",\n  \"object\": \"chat.completion\",\n  \"model\": \"hive/vision-language-model\",\n  \"created\": 1754616922805,\n  \"choices\": [\n    {\n      \"index\": 0,\n      \"message\": {\n        \"role\": \"assistant\",\n        \"content\": \"{\\\"ai_generated_score\\\": 0.0}\"\n      },\n      \"finish_reason\": \"stop\"\n    }\n  ],\n  \"usage\": {\n    \"prompt_tokens\": 1325,\n    \"completion_tokens\": 11,\n    \"total_tokens\": 1336\n  }\n}',0,'2025-08-08 01:35:24'),(17,69,10,'hive.ai-vlm','{\n  \"id\": \"ac80c1d3-73f8-11f0-aac8-124bc08a3a4b\",\n  \"object\": \"chat.completion\",\n  \"model\": \"hive/vision-language-model\",\n  \"created\": 1754617233168,\n  \"choices\": [\n    {\n      \"index\": 0,\n      \"message\": {\n        \"role\": \"assistant\",\n        \"content\": \"{\\\"ai_generated_score\\\": 0.0}\"\n      },\n      \"finish_reason\": \"stop\"\n    }\n  ],\n  \"usage\": {\n    \"prompt_tokens\": 1325,\n    \"completion_tokens\": 11,\n    \"total_tokens\": 1336\n  }\n}',0,'2025-08-08 01:40:35'),(20,72,10,'hive.ai-vlm','{\n  \"id\": \"ccebd3c1-7403-11f0-8a74-71c4ae98afe2\",\n  \"object\": \"chat.completion\",\n  \"model\": \"hive/vision-language-model\",\n  \"created\": 1754622012021,\n  \"choices\": [\n    {\n      \"index\": 0,\n      \"message\": {\n        \"role\": \"assistant\",\n        \"content\": \"{\\\"ai_generated_score\\\": 1.0}\"\n      },\n      \"finish_reason\": \"stop\"\n    }\n  ],\n  \"usage\": {\n    \"prompt_tokens\": 1325,\n    \"completion_tokens\": 11,\n    \"total_tokens\": 1336\n  }\n}',1,'2025-08-08 03:00:14'),(21,73,10,'hive.ai-vlm','{\n  \"id\": \"b68321c3-7404-11f0-8568-73ef8fc7c86f\",\n  \"object\": \"chat.completion\",\n  \"model\": \"hive/vision-language-model\",\n  \"created\": 1754622403922,\n  \"choices\": [\n    {\n      \"index\": 0,\n      \"message\": {\n        \"role\": \"assistant\",\n        \"content\": \"{\\\"ai_generated_score\\\": 1.0}\"\n      },\n      \"finish_reason\": \"stop\"\n    }\n  ],\n  \"usage\": {\n    \"prompt_tokens\": 1325,\n    \"completion_tokens\": 11,\n    \"total_tokens\": 1336\n  }\n}',1,'2025-08-08 03:06:46');
/*!40000 ALTER TABLE `ai_detection_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artist_earnings`
--

DROP TABLE IF EXISTS `artist_earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artist_earnings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artist_id` int(11) NOT NULL,
  `source_id` int(11) NOT NULL,
  `source_type` enum('artwork_sale','commission') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `platform_fee` decimal(10,2) NOT NULL,
  `net_amount` decimal(10,2) NOT NULL,
  `status` enum('pending_clearance','cleared','paid_out') NOT NULL DEFAULT 'pending_clearance',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist_earnings`
--

LOCK TABLES `artist_earnings` WRITE;
/*!40000 ALTER TABLE `artist_earnings` DISABLE KEYS */;
INSERT INTO `artist_earnings` VALUES (1,1,5,'commission',100.00,15.00,85.00,'pending_clearance','2025-08-22 14:51:29'),(2,1,5,'commission',100.00,15.00,85.00,'pending_clearance','2025-08-22 14:58:35'),(3,1,5,'commission',100.00,15.00,85.00,'pending_clearance','2025-08-22 14:58:57'),(4,1,5,'commission',100.00,15.00,85.00,'pending_clearance','2025-08-22 14:59:19');
/*!40000 ALTER TABLE `artist_earnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artist_skills`
--

DROP TABLE IF EXISTS `artist_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artist_skills` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  PRIMARY KEY (`user_id`,`skill_id`),
  KEY `fk_artist_skills_user_id` (`user_id`),
  KEY `fk_artist_skills_skill_id` (`skill_id`),
  CONSTRAINT `fk_artist_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_artist_skills_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artist_skills`
--

LOCK TABLES `artist_skills` WRITE;
/*!40000 ALTER TABLE `artist_skills` DISABLE KEYS */;
INSERT INTO `artist_skills` VALUES (10,3,'intermediate'),(10,16,'intermediate'),(10,18,'intermediate');
/*!40000 ALTER TABLE `artist_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `artworks`
--

DROP TABLE IF EXISTS `artworks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_image` varchar(500) NOT NULL,
  `watermarked_image` varchar(500) DEFAULT NULL,
  `thumbnail_image` varchar(500) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `medium` varchar(255) DEFAULT NULL,
  `year_created` year(4) DEFAULT NULL,
  `status` enum('draft','published','sold','removed','pending_detection','rejected_ai','rejected_error') DEFAULT 'draft',
  `ai_detection_result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_detection_result`)),
  `ai_detection_score` decimal(3,2) DEFAULT NULL,
  `is_ai_generated` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `is_portfolio_piece` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `artwork_type` enum('digital','physical') NOT NULL DEFAULT 'physical',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`featured`),
  KEY `idx_price` (`price`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `artworks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `artworks_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `artworks`
--

LOCK TABLES `artworks` WRITE;
/*!40000 ALTER TABLE `artworks` DISABLE KEYS */;
INSERT INTO `artworks` VALUES (2,2,3,'Digital Still Life','Volup consuasor cotidie quasi creta apostolus tactus adnuo quam. Centum curiositas sulum laboriosam totidem incidunt. Created using digital art techniques and modern software tools.',122231.79,'https://picsum.photos/id/101/800/600',NULL,'https://picsum.photos/id/101/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,231,49,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(3,3,1,'Game Asset Design','Textor attollo aptus cena curvo. Impedit cedo demoror. Created using digital art techniques and modern software tools.',90083.15,'https://picsum.photos/id/102/800/600',NULL,'https://picsum.photos/id/102/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,156,12,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(4,5,10,'Abstract Digital Composition','Atrocitas bellum molestiae xiphias advoco ultio virga credo molestias curatio. Admiratio truculenter annus consectetur aliquid theatrum colligo adulescens. Created using digital art techniques and modern software tools.',120363.59,'/uploads/artwork-1754615906234-238200940.png',NULL,'/uploads/artwork-1754615906234-238200940.png',NULL,NULL,NULL,'published',NULL,NULL,0,390,38,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(5,10,10,'Fantasy Character Art','Accusamus truculenter assumenda acer tergo acer ex ipsa. Vinculum contra spes. Created using digital art techniques and modern software tools.',110045.99,'https://picsum.photos/id/104/800/600',NULL,'https://picsum.photos/id/104/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,97,60,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(6,5,7,'Digital Photo Manipulation','Voluptatem desolo degusto perferendis non curso copiose. Aduro rem dedico appello volutabrum vulnus sum vinculum cui ascit. Created using digital art techniques and modern software tools.',171110.15,'https://picsum.photos/id/105/800/600',NULL,'https://picsum.photos/id/105/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,194,31,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(7,10,2,'Vector Art Design','Illo vergo distinctio at tubineus defetiscor accusamus. Suus clementia commodi vita minima cura aliquid odio tandem degero. Created using digital art techniques and modern software tools.',103531.48,'/uploads/artwork-1754614694737-167870365.png',NULL,'/uploads/artwork-1754614694737-167870365.png',NULL,NULL,NULL,'published',NULL,NULL,0,63,22,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(8,9,7,'Logo Design Project','Cohaero aspernatur quod constans valetudo aeger velum placeat vereor. Molestias cursus amicitia dedico sponte clarus vestigium socius. Created using digital art techniques and modern software tools.',249935.45,'https://picsum.photos/id/107/800/600',NULL,'https://picsum.photos/id/107/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,223,44,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(9,4,8,'Logo Design Project','Tantum ventito debeo curso communis tergeo. Caput cotidie coerceo excepturi suspendo esse. Created using digital art techniques and modern software tools.',110230.45,'https://picsum.photos/id/108/800/600',NULL,'https://picsum.photos/id/108/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,389,21,0,1,'2025-08-22 02:10:31','2025-08-22 12:44:59','digital'),(10,1,10,'Abstract Digital Composition','Volaticus corrumpo consectetur. Toties aestus delectatio claustrum socius spectaculum maiores. Created using digital art techniques and modern software tools.',100455.89,'/uploads/artwork-1754616247289-377382476.png',NULL,'/uploads/artwork-1754616247289-377382476.png',NULL,NULL,NULL,'',NULL,NULL,0,250,24,0,1,'2025-08-22 02:10:31','2025-08-22 12:38:24','digital'),(11,1,10,'Logo Design Project','Amo casus coniecto comitatus deputo supellex tamquam exercitationem. Adsum alo talis casso vaco tripudio vester strues verecundia. Created using digital art techniques and modern software tools.',191149.65,'https://picsum.photos/id/110/800/600',NULL,'https://picsum.photos/id/110/400/300',NULL,NULL,NULL,'',NULL,NULL,0,38,63,0,1,'2025-08-22 02:10:31','2025-08-22 12:37:19','digital'),(12,2,9,'Abstract Digital Composition','Alo condico via temporibus vacuus aegre aer veritas charisma. Subseco speciosus tempora. Created using digital art techniques and modern software tools.',211349.09,'https://picsum.photos/id/111/800/600',NULL,'https://picsum.photos/id/111/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,380,15,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(13,6,6,'Concept Art Environment','Bellicus decipio ultio pax cado sono vereor carpo. Decor vinum ustulo colo charisma cuppedia praesentium carbo. Created using digital art techniques and modern software tools.',123180.79,'/uploads/artwork-1754615432400-802658496.png',NULL,'/uploads/artwork-1754615432400-802658496.png',NULL,NULL,NULL,'',NULL,NULL,0,384,15,0,1,'2025-08-22 02:10:31','2025-08-22 12:37:14','digital'),(14,2,10,'Digital Portrait Study','Enim dedico acer pecus spargo venustas cotidie delibero. Adamo caute creo custodia crur pax officia. Created using digital art techniques and modern software tools.',194790.39,'https://picsum.photos/id/113/800/600',NULL,'https://picsum.photos/id/113/400/300',NULL,NULL,NULL,'',NULL,NULL,0,201,74,0,1,'2025-08-22 02:10:31','2025-08-22 12:37:05','digital'),(15,6,3,'Digital Portrait Study','Virtus chirographum crastinus verbera patior colligo talio auctor. Spes paulatim tenus caecus crastinus denuncio aedificium. Created using digital art techniques and modern software tools.',124943.26,'https://picsum.photos/id/114/800/600',NULL,'https://picsum.photos/id/114/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,27,83,0,1,'2025-08-22 02:10:31','2025-08-22 02:10:31','digital'),(16,1,1,'Motion Graphics Frame','Minima vitae ultio thorax altus. Deputo comis constans surgo abduco talio dignissimos contra adsidue despecto. Created using digital art techniques and modern software tools.',12465.19,'/uploads/artwork-1754615906234-238200940.png',NULL,'/uploads/artwork-1754615906234-238200940.png',NULL,NULL,NULL,'',NULL,NULL,0,204,64,0,1,'2025-08-22 02:10:31','2025-08-22 12:38:39','digital'),(17,5,7,'Game Asset Design','Patria inflammatio tergiversatio argumentum claro tepidus. Comedo dens cenaculum concedo sonitus cogo. Created using digital art techniques and modern software tools.',13464.40,'https://picsum.photos/id/116/800/600',NULL,'https://picsum.photos/id/116/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,448,100,0,1,'2025-08-22 02:10:31','2025-08-22 12:44:51','digital'),(18,8,6,'Concept Art Environment','Perspiciatis curo vociferor argentum. Volaticus vilis solium cuppedia. Created using digital art techniques and modern software tools.',19272.99,'https://picsum.photos/id/117/800/600',NULL,'https://picsum.photos/id/117/400/300',NULL,NULL,NULL,'',NULL,NULL,0,321,72,0,1,'2025-08-22 02:10:31','2025-08-22 12:35:01','digital'),(19,10,7,'Fantasy Character Art','Validus acervus vomica iste culpo strenuus socius. Aperio speciosus conculco crudelis. Created using digital art techniques and modern software tools.',44498.99,'/uploads/artwork-1754614694737-167870365.png',NULL,'/uploads/artwork-1754614694737-167870365.png',NULL,NULL,NULL,'',NULL,NULL,0,75,7,0,1,'2025-08-22 02:10:31','2025-08-22 12:43:05','digital'),(20,1,2,'Digital Photo Manipulation','Recusandae curto usus arcus accusamus damnatio. Enim vos taedium voco cervus strenuus quod utique. Created using digital art techniques and modern software tools.',135055.05,'https://picsum.photos/id/119/800/600',NULL,'https://picsum.photos/id/119/400/300',NULL,NULL,NULL,'',NULL,NULL,0,200,78,0,1,'2025-08-22 02:10:31','2025-08-22 12:36:37','digital'),(21,5,8,'Digital Illustration Series','Comis tredecim termes atavus bellicus xiphias. Ex adipiscor rerum reprehenderit ventosus impedit tunc ventito. Created using digital art techniques and modern software tools.',57048.40,'https://picsum.photos/id/120/800/600',NULL,'https://picsum.photos/id/120/400/300',NULL,NULL,NULL,'',NULL,NULL,0,171,92,0,1,'2025-08-22 02:10:31','2025-08-22 12:44:18','digital'),(22,4,5,'Digital Landscape Painting','Conscendo admitto caput ars tergeo aestus cinis subseco. Dapifer conscendo communis tantillus quaerat tenax volup aegrotatio collum. Created using digital art techniques and modern software tools.',206252.59,'/uploads/artwork-1754614879344-448403403.png',NULL,'/uploads/artwork-1754614879344-448403403.png',NULL,NULL,NULL,'',NULL,NULL,0,95,73,0,1,'2025-08-22 02:10:31','2025-08-22 12:06:19','digital'),(23,4,1,'Digital Photo Manipulation','Vapulus pariatur aegre a vaco torrens. Voro adeo conspergo argumentum abutor adficio utilis auditor derelinquo. Created using digital art techniques and modern software tools.',187256.49,'https://picsum.photos/id/122/800/600',NULL,'https://picsum.photos/id/122/400/300',NULL,NULL,NULL,'',NULL,NULL,0,268,97,0,1,'2025-08-22 02:10:31','2025-08-22 12:05:48','digital'),(24,4,1,'Vector Art Design','Bellicus curo tametsi civis voveo pauci vilis admitto vestrum antea. Aeneus vestrum tonsor corona despecto apparatus. Created using digital art techniques and modern software tools.',211760.49,'https://picsum.photos/id/123/800/600',NULL,'https://picsum.photos/id/123/400/300',NULL,NULL,NULL,'',NULL,NULL,0,368,98,0,1,'2025-08-22 02:10:31','2025-08-22 12:44:01','digital'),(25,7,8,'Game Asset Design','Dolore crapula adsuesco at aequus audacia ab esse. Delinquo saepe tergo commemoro tabella pel quos. Created using digital art techniques and modern software tools.',164866.79,'/uploads/artwork-1754614879344-448403403.png',NULL,'/uploads/artwork-1754614879344-448403403.png',NULL,NULL,NULL,'',NULL,NULL,0,405,87,0,1,'2025-08-22 02:10:31','2025-08-22 12:33:09','digital'),(26,1,8,'Cyberpunk Character Design','Terebro chirographum dedecor tempore. Solium despecto sollers defendo capio curto unde cur. Created using digital art techniques and modern software tools.',57483.05,'https://picsum.photos/id/125/800/600',NULL,'https://picsum.photos/id/125/400/300',NULL,NULL,NULL,'',NULL,NULL,0,54,37,0,1,'2025-08-22 02:10:31','2025-08-22 12:32:59','digital'),(27,8,7,'Digital Portrait Study','Amiculum varius cognomen. Facilis reprehenderit caries accedo. Created using digital art techniques and modern software tools.',112893.35,'https://picsum.photos/id/126/800/600',NULL,'https://picsum.photos/id/126/400/300',NULL,NULL,NULL,'',NULL,NULL,0,108,65,0,1,'2025-08-22 02:10:31','2025-08-22 12:45:11','digital'),(28,5,10,'Logo Design Project','Validus sumptus voluptas conscendo cursus careo ademptio vergo aufero iure. Desparatus carcer corrigo sublime adfectus desino. Created using digital art techniques and modern software tools.',97008.59,'/uploads/artwork-1754622401964-345610664.png',NULL,'/uploads/artwork-1754622401964-345610664.png',NULL,NULL,NULL,'',NULL,NULL,0,258,15,0,1,'2025-08-22 02:10:31','2025-08-22 10:30:49','digital'),(29,9,7,'Digital Portrait Study','Depromo recusandae super statim cometes voluptatibus pecto. Charisma territo voluptatem copia. Created using digital art techniques and modern software tools.',92762.05,'https://picsum.photos/id/128/800/600',NULL,'https://picsum.photos/id/128/400/300',NULL,NULL,NULL,'published',NULL,NULL,0,474,60,0,1,'2025-08-22 02:10:31','2025-08-22 12:15:52','digital'),(30,10,6,'Logo Design Project','Urbanus speculum facere. Debitis civis statim. Created using digital art techniques and modern software tools.',130679.15,'https://picsum.photos/id/129/800/600',NULL,'https://picsum.photos/id/129/400/300',NULL,NULL,NULL,'',NULL,NULL,0,499,75,0,1,'2025-08-22 02:10:31','2025-08-22 11:54:55','digital');
/*!40000 ALTER TABLE `artworks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auctions`
--

DROP TABLE IF EXISTS `auctions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auctions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artwork_id` int(11) NOT NULL,
  `starting_bid` decimal(10,2) NOT NULL,
  `current_bid` decimal(10,2) DEFAULT 0.00,
  `reserve_price` decimal(10,2) DEFAULT NULL,
  `bid_increment` decimal(10,2) DEFAULT 100.00,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` enum('upcoming','active','ended','cancelled') DEFAULT 'upcoming',
  `winner_id` int(11) DEFAULT NULL,
  `total_bids` int(11) DEFAULT 0,
  `watchers` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `winner_id` (`winner_id`),
  KEY `idx_artwork_id` (`artwork_id`),
  KEY `idx_status` (`status`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_featured` (`featured`),
  CONSTRAINT `auctions_ibfk_1` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auctions_ibfk_2` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auctions`
--

LOCK TABLES `auctions` WRITE;
/*!40000 ALTER TABLE `auctions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auctions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `auction_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `auction_id` (`auction_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bids_ibfk_1` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bids_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cart_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  `price_at_add` decimal(10,2) NOT NULL,
  `added_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`,`artwork_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (2,1,28,97008.59,'2025-08-22 10:30:49'),(3,1,30,130679.15,'2025-08-22 11:54:55'),(4,1,23,187256.49,'2025-08-22 12:05:48'),(5,1,22,206252.59,'2025-08-22 12:06:19'),(6,2,26,57483.05,'2025-08-22 12:32:59'),(7,2,25,164866.79,'2025-08-22 12:33:09'),(8,2,18,19272.99,'2025-08-22 12:34:32'),(9,2,20,135055.05,'2025-08-22 12:35:09'),(10,2,14,194790.39,'2025-08-22 12:37:05'),(11,2,13,123180.79,'2025-08-22 12:37:14'),(12,2,11,191149.65,'2025-08-22 12:37:19'),(13,2,10,100455.89,'2025-08-22 12:38:22'),(14,2,16,12465.19,'2025-08-22 12:38:39'),(15,2,19,44498.99,'2025-08-22 12:43:05'),(16,2,24,211760.49,'2025-08-22 12:43:56'),(17,2,21,57048.40,'2025-08-22 12:44:18'),(18,2,27,112893.35,'2025-08-22 12:45:11');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `session_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `session_id` (`session_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,17,'2025-08-22 03:54:03','2025-08-22 03:54:03',NULL),(2,19,'2025-08-22 12:32:59','2025-08-22 12:32:59',NULL),(3,1,'2025-08-22 13:11:02','2025-08-22 13:11:02',NULL);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Digital Art','Digital paintings, illustrations, and computer-generated art','digital-art','2025-07-24 16:20:31'),(2,'Traditional Painting','Oil, acrylic, watercolor, and other traditional painting mediums','traditional-painting','2025-07-24 16:20:31'),(3,'Photography','Fine art photography, portraits, landscapes, and conceptual photography','photography','2025-07-24 16:20:31'),(4,'Sculpture','3D artworks including clay, metal, wood, and mixed media sculptures','sculpture','2025-07-24 16:20:31'),(5,'Abstract','Non-representational art focusing on color, form, and composition','abstract','2025-07-24 16:20:31'),(6,'Portrait','Artistic representations of people and characters','portrait','2025-07-24 16:20:31'),(7,'Landscape','Natural and urban landscape artworks','landscape','2025-07-24 16:20:31'),(8,'Architecture','Architectural photography and drawings','architecture','2025-07-24 16:20:31'),(9,'Mixed Media','Artworks combining multiple artistic mediums and techniques','mixed-media','2025-07-24 16:20:31'),(10,'Conceptual','Idea-based art that emphasizes concept over traditional aesthetic','conceptual','2025-07-24 16:20:31');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_deliveries`
--

DROP TABLE IF EXISTS `commission_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commission_deliveries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commission_id` int(11) NOT NULL,
  `project_milestone_id` int(11) DEFAULT NULL,
  `uploader_id` int(11) NOT NULL,
  `delivery_type` enum('milestone','final','revision','preview') NOT NULL DEFAULT 'milestone',
  `file_path` varchar(500) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending',
  `revision_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_commission_deliveries_commission_id` (`commission_id`),
  KEY `fk_commission_deliveries_uploader_id` (`uploader_id`),
  KEY `fk_commission_deliveries_project_milestone_id` (`project_milestone_id`),
  KEY `idx_deliveries_status` (`status`),
  KEY `idx_deliveries_project_milestone` (`project_milestone_id`),
  CONSTRAINT `fk_commission_deliveries_commission` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_commission_deliveries_project_milestone` FOREIGN KEY (`project_milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commission_deliveries_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_deliveries`
--

LOCK TABLES `commission_deliveries` WRITE;
/*!40000 ALTER TABLE `commission_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `commission_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_listings`
--

DROP TABLE IF EXISTS `commission_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commission_listings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artist_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `pricing_model` enum('fixed','tiered','hourly') NOT NULL,
  `pricing_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`pricing_details`)),
  `revisions_policy` text DEFAULT NULL,
  `turnaround_time` varchar(100) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `status` enum('active','inactive','paused','archived') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_commission_listings_artist_id` (`artist_id`),
  CONSTRAINT `fk_commission_listings_artist` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_listings`
--

LOCK TABLES `commission_listings` WRITE;
/*!40000 ALTER TABLE `commission_listings` DISABLE KEYS */;
INSERT INTO `commission_listings` VALUES (1,10,'fdaf','fdafs','tiered','[{\"title\":\"Basic\",\"price\":\"321\",\"description\":\"headshot\"}]','2 revision 10$','3 weeks','anime, fantasy','active','2025-08-11 08:21:04','2025-08-11 08:21:04'),(2,10,'dsas','dsadsa','tiered','[{\"title\":\"Basidsadc\",\"price\":\"412\",\"description\":\"sadsa\"}]','ddsad','dsadas','dsadsa','active','2025-08-11 08:26:14','2025-08-11 08:26:14'),(3,1,'I WILL MAKE YOUR BUSINESS LOGO','LOGO GODS AKO','tiered','[{\"title\":\"Basic\",\"price\":\"1000\",\"description\":\"Flat colors\"},{\"title\":\"Advance\",\"price\":\"2000\",\"description\":\"Fully customzable\"}]','2','1 week','Logo, Anime, Blabla','active','2025-08-21 14:39:13','2025-08-21 14:39:13');
/*!40000 ALTER TABLE `commission_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_payments`
--

DROP TABLE IF EXISTS `commission_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commission_payments` (
  `id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `milestone_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `project_id` (`project_id`),
  KEY `milestone_id` (`milestone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_payments`
--

LOCK TABLES `commission_payments` WRITE;
/*!40000 ALTER TABLE `commission_payments` DISABLE KEYS */;
INSERT INTO `commission_payments` VALUES ('link_2HELPSyzyoZMUxURRvQqeKkZ',17,5,NULL,100.00,'pending','2025-08-22 10:10:36'),('link_34catnQBeC9N3otuUEPtrwum',17,5,NULL,100.00,'pending','2025-08-22 13:53:55'),('link_3gbn1bZoNBEiNMXM7guvBRE3',17,5,NULL,100.00,'pending','2025-08-22 09:44:57'),('link_67feMUiBVKTg539ZqTJXd7Zf',17,5,NULL,100.00,'paid','2025-08-22 14:41:11'),('link_7pmynH7zAjrLezujRx4gVDwd',15,3,NULL,500.00,'pending','2025-08-19 08:38:10'),('link_8HiXkxT6cSZQcKHRiN5ASopv',17,5,NULL,100.00,'pending','2025-08-22 11:55:44'),('link_8YKXa418CFthkeX2mW42MHMQ',17,5,NULL,100.00,'pending','2025-08-22 13:45:26'),('link_bGWfSVMJ69Gn5FFpHm77AoHm',17,5,NULL,100.00,'pending','2025-08-22 13:37:11'),('link_chTLTQH6MPExXwCB1qg5ooB7',17,5,NULL,100.00,'pending','2025-08-22 13:40:56'),('link_D6NCueDT4yZKXxFsXg2icjcG',17,5,NULL,100.00,'pending','2025-08-22 11:56:33'),('link_DBfKQmCqkcTYK5aBTnnHaj2G',17,5,NULL,100.00,'pending','2025-08-22 12:03:07'),('link_DjqYdREZqcJojwhGxeqf6Erx',17,5,NULL,100.00,'pending','2025-08-22 08:17:31'),('link_EDBSS8kp3JjWBWX9LYUqMpBa',17,5,NULL,100.00,'pending','2025-08-22 10:11:44'),('link_FaU5CXqoZccXqqhjU3ajLfR8',17,5,NULL,100.00,'pending','2025-08-22 13:51:23'),('link_fTK61k1qPh891wjm135AqBAy',17,5,NULL,100.00,'pending','2025-08-22 09:45:03'),('link_ftZks2C2D8x4neiwAtLAGAT2',17,5,NULL,100.00,'pending','2025-08-22 10:06:46'),('link_FXRbUR5JBLyePx87wRHxDA9V',17,5,NULL,100.00,'pending','2025-08-22 14:39:43'),('link_G8E4CwqvVWLXZbGEnHDSUHWe',17,5,NULL,100.00,'paid','2025-08-22 14:41:32'),('link_gPGZsBAEhdfrxnWMtpEWyLDM',17,5,NULL,100.00,'pending','2025-08-22 13:16:15'),('link_J8Bj3chUuvaaXUmh4KJ3Cnqh',17,5,NULL,100.00,'pending','2025-08-22 09:45:16'),('link_JiSpKA3WL9tA7EUy3C5arevr',17,5,NULL,100.00,'pending','2025-08-22 10:02:21'),('link_kNwYdNpMyFoE6L5dwQAX7a3V',17,5,NULL,100.00,'pending','2025-08-22 09:59:18'),('link_nB9vBjSLJiJD1yvWJ4JAqtNz',17,5,NULL,100.00,'pending','2025-08-22 13:58:40'),('link_nxjqDBjiDmg1PD3y523xCrJf',17,5,NULL,100.00,'pending','2025-08-22 14:34:08'),('link_RdC9xH8qMtrLprFNZrtifgSy',17,5,NULL,100.00,'pending','2025-08-22 11:52:07'),('link_S18w1e1vasjM2k8mErajQzQB',17,5,NULL,100.00,'pending','2025-08-22 09:58:07'),('link_S7cXxFbGLTkAxYiaNcPfoyr7',15,3,NULL,500.00,'pending','2025-08-19 08:39:20'),('link_vgcMs3zu49WBxwo84tQSkVE6',17,5,NULL,100.00,'paid','2025-08-22 14:40:32'),('link_WMZvC3CyxnTqHenbVri1Hgp9',17,5,NULL,100.00,'pending','2025-08-22 13:36:27'),('link_x2LDXfL5s4AE7iktD7gjGEdE',17,5,NULL,100.00,'pending','2025-08-22 11:49:34'),('link_x5Cy3FPgzmFyX8FvYZXoEoWZ',17,5,NULL,100.00,'pending','2025-08-22 09:38:56'),('link_yQTzhY49qMRmdcHqWL2NKsKZ',17,5,NULL,100.00,'pending','2025-08-22 13:57:16'),('link_YquwJYkruFbUS7kEJCG7Uzdw',17,5,NULL,100.00,'paid','2025-08-22 14:51:13'),('link_ZqYfwXegyAHXhW8jpLPa15Tm',17,5,NULL,100.00,'pending','2025-08-22 10:07:11'),('link_Zy1b4TrCm6ZkJCpCpkvwkK4G',17,5,NULL,100.00,'pending','2025-08-22 10:29:59');
/*!40000 ALTER TABLE `commission_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commission_proposals`
--

DROP TABLE IF EXISTS `commission_proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commission_proposals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commission_id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `proposal_text` text NOT NULL,
  `proposed_price` decimal(10,2) NOT NULL,
  `estimated_completion` date DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `commission_id` (`commission_id`),
  KEY `artist_id` (`artist_id`),
  KEY `idx_proposals_status` (`status`),
  CONSTRAINT `commission_proposals_ibfk_1` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commission_proposals_ibfk_2` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commission_proposals`
--

LOCK TABLES `commission_proposals` WRITE;
/*!40000 ALTER TABLE `commission_proposals` DISABLE KEYS */;
INSERT INTO `commission_proposals` VALUES (1,2,10,'lets do that',10000.00,'0000-00-00','accepted','2025-08-11 08:57:49'),(2,1,10,'lets go',10000.00,'0000-00-00','accepted','2025-08-11 09:42:10'),(3,3,10,'Lets go',500.00,'2025-08-30','accepted','2025-08-19 08:31:00'),(4,4,10,'dsadas',10.00,'2025-08-25','pending','2025-08-21 13:30:44'),(5,4,1,'I\'ll do that job for you',20.00,'2025-08-22','pending','2025-08-22 04:45:55'),(6,5,1,'I\'ll do it',50.00,'2025-08-22','accepted','2025-08-22 06:23:41'),(7,6,1,'1',100.00,'2025-08-25','accepted','2025-08-22 08:17:02');
/*!40000 ALTER TABLE `commission_proposals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commissions`
--

DROP TABLE IF EXISTS `commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `artist_id` int(11) DEFAULT NULL,
  `source_listing_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `budget_min` decimal(10,2) DEFAULT NULL,
  `budget_max` decimal(10,2) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','awaiting_proposal','pending_review','awaiting_payment','in_progress','completed','cancelled') DEFAULT 'open',
  `accepted_proposal_id` int(11) DEFAULT NULL,
  `reference_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reference_images`)),
  `requirements` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_artist_id` (`artist_id`),
  KEY `idx_status` (`status`),
  KEY `idx_budget_max` (`budget_max`),
  KEY `fk_commissions_accepted_proposal` (`accepted_proposal_id`),
  KEY `source_listing_id` (`source_listing_id`),
  KEY `idx_commissions_status` (`status`),
  KEY `idx_commissions_artist_status` (`artist_id`,`status`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commissions_ibfk_3` FOREIGN KEY (`source_listing_id`) REFERENCES `commission_listings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_commissions_accepted_proposal` FOREIGN KEY (`accepted_proposal_id`) REFERENCES `commission_proposals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commissions`
--

LOCK TABLES `commissions` WRITE;
/*!40000 ALTER TABLE `commissions` DISABLE KEYS */;
INSERT INTO `commissions` VALUES (1,15,10,2,'Request based on: \"dsas\"','Referring to your listing for \"dsas\", I would like to request the following:\r\n\r\ndsadsa\r\n\r\n[Please add your specific details here]',10000.00,20000.00,'2025-08-30','in_progress',2,'[\"/uploads/reference_images-1754902129521-126744424.png\"]','dsadada','2025-08-11 08:48:49','2025-08-11 09:42:33'),(2,15,10,2,'Request based on: \"dsas\"','Referring to your listing for \"dsas\", I would like to request the following:\r\n\r\ndsadsa\r\n\r\n[Please add your specific details here]',100.00,200.00,'2025-08-30','in_progress',1,'[\"/uploads/reference_images-1754902454501-307319440.png\"]','dsadsa','2025-08-11 08:54:14','2025-08-11 09:04:04'),(3,15,10,NULL,'1000 THIEVES','I WANT IT TO BE SOMETHING LIKE ONE PIECE LIKE',100.00,1000.00,'2025-08-30','in_progress',3,'[]','DSADSA','2025-08-19 08:29:58','2025-08-19 08:34:40'),(4,15,NULL,NULL,'Logo Design','I want to create a logo for my business named Joiqs Agency',NULL,NULL,'2025-08-20','open',NULL,'[\"/uploads/reference_images-1755628621699-311725245.png\"]','png, ','2025-08-19 18:37:01','2025-08-19 18:37:01'),(5,17,1,NULL,'Custom Digital Character','I want it to be an anime type style',NULL,NULL,'2025-09-21','in_progress',6,'[\"/uploads/reference_images-1755843764562-643540560.png\"]','i want it to be in png directly on a portrait ','2025-08-22 06:22:44','2025-08-22 07:01:27'),(6,17,1,NULL,'Logo','test',NULL,NULL,'2025-09-21','in_progress',7,'[\"/uploads/reference_images-1755850605257-796384210.png\"]','1x1','2025-08-22 08:16:45','2025-08-22 08:17:27'),(7,17,1,3,'Request based on: \"I WILL MAKE YOUR BUSINESS LOGO\"','Referring to your listing for \"I WILL MAKE YOUR BUSINESS LOGO\", I would like to request the following:\r\n\r\nLOGO GODS AKO\r\n\r\n[Please add your specific details here]',0.00,0.00,'2025-09-21','awaiting_proposal',NULL,'[]','','2025-08-22 13:09:28','2025-08-22 13:09:28');
/*!40000 ALTER TABLE `commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `digital_asset_access`
--

DROP TABLE IF EXISTS `digital_asset_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `digital_asset_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_artwork_unique` (`user_id`,`artwork_id`),
  KEY `digital_asset_access_ibfk_2` (`artwork_id`),
  CONSTRAINT `digital_asset_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `digital_asset_access_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `digital_asset_access`
--

LOCK TABLES `digital_asset_access` WRITE;
/*!40000 ALTER TABLE `digital_asset_access` DISABLE KEYS */;
INSERT INTO `digital_asset_access` VALUES (1,15,41,'2025-07-25 17:07:26'),(2,15,40,'2025-07-27 02:09:16'),(3,15,35,'2025-07-27 02:12:25'),(4,15,26,'2025-07-27 02:27:57'),(5,15,47,'2025-07-27 04:04:34'),(6,15,34,'2025-07-27 18:34:55'),(7,21,45,'2025-07-28 14:57:07'),(8,15,28,'2025-08-05 15:27:15'),(9,15,3,'2025-08-05 15:46:13');
/*!40000 ALTER TABLE `digital_asset_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  KEY `idx_following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES (2,17,1,'2025-08-22 04:44:39');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`user_id`,`artwork_id`),
  KEY `idx_artwork_id` (`artwork_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `commission_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `auction_id` int(11) DEFAULT NULL,
  `message_text` text NOT NULL,
  `message_type` enum('text','image','file') DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `auction_id` (`auction_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_commission_id` (`commission_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `fk_messages_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,15,7,NULL,NULL,NULL,'Hi','text',NULL,NULL,'2025-08-05 08:21:48'),(2,7,15,NULL,NULL,NULL,'Hello','text',NULL,NULL,'2025-08-05 08:23:10'),(3,15,7,NULL,NULL,NULL,'Hello pogi','text',NULL,NULL,'2025-08-05 15:47:55'),(4,7,15,NULL,NULL,NULL,'bakit, nagbebenta lang po ako','text',NULL,NULL,'2025-08-05 15:48:13'),(5,15,7,NULL,NULL,NULL,'lab u lab','text',NULL,NULL,'2025-08-05 15:48:24'),(6,7,15,NULL,NULL,NULL,'kk','text',NULL,NULL,'2025-08-05 15:48:35'),(7,15,10,NULL,NULL,NULL,'Hi','text',NULL,NULL,'2025-08-07 15:53:17'),(8,15,10,NULL,NULL,NULL,'Hello','text',NULL,NULL,'2025-08-11 09:04:30'),(9,15,10,NULL,NULL,NULL,'Hi','text',NULL,NULL,'2025-08-21 13:40:26'),(10,17,1,NULL,NULL,NULL,'dsadsada','text',NULL,NULL,'2025-08-22 03:58:08'),(11,17,1,NULL,NULL,NULL,'hello','text',NULL,NULL,'2025-08-22 03:58:12'),(12,17,1,NULL,NULL,NULL,'what i can do','text',NULL,NULL,'2025-08-22 03:58:13'),(13,17,1,NULL,NULL,NULL,'','image','/uploads/message-1755835432513-607380712.png',NULL,'2025-08-22 04:03:52'),(14,1,17,NULL,NULL,NULL,'yyp','text',NULL,NULL,'2025-08-22 04:04:06'),(15,17,1,NULL,NULL,NULL,'aaa','text',NULL,NULL,'2025-08-22 04:05:36'),(16,17,1,NULL,NULL,NULL,'Hi','text',NULL,NULL,'2025-08-22 04:09:18'),(17,17,1,NULL,NULL,NULL,'Hello','text',NULL,NULL,'2025-08-22 04:10:00'),(18,17,1,NULL,NULL,NULL,'yey','text',NULL,NULL,'2025-08-22 04:25:56'),(19,1,17,NULL,NULL,NULL,'wat','text',NULL,NULL,'2025-08-22 04:26:00'),(20,17,1,NULL,NULL,NULL,'hey broskie','text',NULL,NULL,'2025-08-22 04:44:49');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestone_deliveries`
--

DROP TABLE IF EXISTS `milestone_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `milestone_deliveries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `milestone_id` int(11) NOT NULL,
  `uploader_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `milestone_id` (`milestone_id`),
  KEY `uploader_id` (`uploader_id`),
  CONSTRAINT `fk_deliveries_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deliveries_user` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestone_deliveries`
--

LOCK TABLES `milestone_deliveries` WRITE;
/*!40000 ALTER TABLE `milestone_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestone_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Cedric Haag started following you.','/artists/15',0,'2025-08-05 15:26:23'),(2,5,'Your artwork \"Inwood Park\" has been sold!','/artist/dashboard',0,'2025-08-05 15:27:15'),(3,7,'Your artwork \"Untitled\" has been sold!','/artist/dashboard',1,'2025-08-05 15:46:13'),(4,10,'Cedric Haag started following you.','/artists/15',1,'2025-08-07 15:52:22'),(5,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/50',1,'2025-08-08 00:18:55'),(6,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/50',0,'2025-08-08 00:18:55'),(7,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/51',1,'2025-08-08 00:45:19'),(8,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/51',0,'2025-08-08 00:45:19'),(9,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/52',1,'2025-08-08 00:50:48'),(10,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/52',0,'2025-08-08 00:50:48'),(11,10,'Great news! Your artwork \"dsadad\" has passed analysis and is now published.','/artworks/53',0,'2025-08-08 00:58:17'),(12,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadad\"','/artworks/53',0,'2025-08-08 00:58:17'),(13,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/54',0,'2025-08-08 01:00:23'),(14,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/54',0,'2025-08-08 01:00:23'),(15,10,'Great news! Your artwork \"dsadada\" has passed analysis and is now published.','/artworks/55',0,'2025-08-08 01:01:21'),(16,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadada\"','/artworks/55',0,'2025-08-08 01:01:21'),(17,10,'Great news! Your artwork \"dsadas\" has passed analysis and is now published.','/artworks/56',0,'2025-08-08 01:05:27'),(18,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadas\"','/artworks/56',0,'2025-08-08 01:05:27'),(19,10,'Great news! Your artwork \"dsadas\" has passed analysis and is now published.','/artworks/57',0,'2025-08-08 01:08:53'),(20,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadas\"','/artworks/57',0,'2025-08-08 01:08:53'),(21,10,'Great news! Your artwork \"dsadsad\" has passed analysis and is now published.','/artworks/58',0,'2025-08-08 01:10:33'),(22,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsad\"','/artworks/58',0,'2025-08-08 01:10:33'),(23,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/59',0,'2025-08-08 01:11:33'),(24,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/59',0,'2025-08-08 01:11:33'),(25,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/60',0,'2025-08-08 01:13:35'),(26,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/60',0,'2025-08-08 01:13:35'),(27,10,'Great news! Your artwork \"dsadsadsa\" has passed analysis and is now published.','/artworks/61',0,'2025-08-08 01:15:05'),(28,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsadsa\"','/artworks/61',0,'2025-08-08 01:15:05'),(29,10,'Great news! Your artwork \"dsada\" has passed analysis and is now published.','/artworks/62',0,'2025-08-08 01:18:27'),(30,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsada\"','/artworks/62',0,'2025-08-08 01:18:27'),(31,10,'Great news! Your artwork \"dsadada\" has passed analysis and is now published.','/artworks/63',0,'2025-08-08 01:21:36'),(32,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadada\"','/artworks/63',0,'2025-08-08 01:21:36'),(33,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/64',0,'2025-08-08 01:24:10'),(34,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/64',1,'2025-08-08 01:24:10'),(35,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/65',0,'2025-08-08 01:25:39'),(36,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/65',1,'2025-08-08 01:25:39'),(37,10,'Great news! Your artwork \"dsadsa\" has passed analysis and is now published.','/artworks/66',0,'2025-08-08 01:26:21'),(38,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsadsa\"','/artworks/66',1,'2025-08-08 01:26:21'),(39,10,'Great news! Your artwork \"dsada\" has passed analysis and is now published.','/artworks/67',0,'2025-08-08 01:35:24'),(40,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsada\"','/artworks/67',1,'2025-08-08 01:35:24'),(41,10,'Your artwork \"123123\" was rejected as AI-generated (Score: 1.00).','/artist/dashboard',0,'2025-08-08 01:39:17'),(42,10,'Great news! Your artwork \"dsad\" has passed analysis and is now published.','/artworks/69',1,'2025-08-08 01:40:35'),(43,15,'Mr. Albert Bayer has uploaded a new artwork: \"dsad\"','/artworks/69',1,'2025-08-08 01:40:35'),(44,10,'Your artwork \"Test\" was rejected as AI-generated (Score: 1.00).','/artist/dashboard',1,'2025-08-08 02:02:53'),(45,10,'Your artwork \"dsadsa\" was rejected as AI-generated (Score: 1.00).','/artist/dashboard',1,'2025-08-08 02:23:11'),(46,10,'Your artwork \"dsadsa\" was rejected as AI-generated (Score: 1.00).','/artist/dashboard',1,'2025-08-08 03:00:14'),(47,10,'Your artwork \"dsadas\" was rejected as AI-generated (Score: 1.00).','/artist/dashboard',1,'2025-08-08 03:06:46'),(48,10,'Your proposal for a commission has been accepted!','/project/3',0,'2025-08-19 08:34:40'),(49,15,'You have a new proposal for your commission: \"Untitled\"','/commissions/4/proposals',1,'2025-08-21 13:30:44'),(50,10,'Cedric Haag started following you.','/artists/15',0,'2025-08-21 13:39:08'),(51,10,'You have a new message from Cedric Haag.','/messages/15',0,'2025-08-21 13:40:26'),(52,2,'John Gm started following you.','/artists/22',0,'2025-08-21 14:47:13'),(53,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:21:04'),(54,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:21:13'),(55,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:26:29'),(56,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:26:58'),(57,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:27:21'),(58,1,'John Gm started following you.','/artists/22',0,'2025-08-21 15:27:44'),(59,4,'John Gm started following you.','/artists/22',0,'2025-08-21 15:29:20'),(60,8,'Great news! Your artwork \"test\" has passed analysis and is now published.','/artworks/31',0,'2025-08-22 03:50:14'),(61,1,'Kay Wunsch MD started following you.','/artists/17',0,'2025-08-22 03:56:06'),(62,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 03:58:08'),(63,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 03:58:12'),(64,1,'You have a new message from Kay Wunsch MD.','/messages/17',1,'2025-08-22 03:58:13'),(65,17,'You have a new message from Grant Lindgren.','/messages/1',0,'2025-08-22 04:04:06'),(66,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 04:05:36'),(67,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 04:09:18'),(68,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 04:10:00'),(69,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 04:25:56'),(70,17,'You have a new message from Grant Lindgren.','/messages/1',0,'2025-08-22 04:26:00'),(71,1,'Kay Wunsch MD started following you.','/artists/17',0,'2025-08-22 04:44:39'),(72,1,'You have a new message from Kay Wunsch MD.','/messages/17',0,'2025-08-22 04:44:49'),(73,15,'You have a new proposal for your commission: \"Untitled\"','/commissions/4/proposals',0,'2025-08-22 04:45:55'),(74,17,'You have a new proposal for your commission: \"Untitled\"','/commissions/5/proposals',1,'2025-08-22 06:23:41'),(75,1,'Your proposal for a commission has been accepted!','/project/4',1,'2025-08-22 07:01:27'),(76,17,'You have a new proposal for your commission: \"Untitled\"','/commissions/6/proposals',0,'2025-08-22 08:17:02'),(77,1,'Your proposal for a commission has been accepted!','/project/5',1,'2025-08-22 08:17:27'),(78,1,'You have received a payment for the project: \"Logo\"','/project/5',0,'2025-08-22 14:51:29'),(79,1,'You have received a payment for the project: \"Logo\"','/project/5',0,'2025-08-22 14:58:35'),(80,1,'You have received a payment for the project: \"Logo\"','/project/5',0,'2025-08-22 14:58:57'),(81,1,'You have received a payment for the project: \"Logo\"','/project/5',0,'2025-08-22 14:59:19');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `artwork_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `title` varchar(255) NOT NULL,
  `artist_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `artwork_id` (`artwork_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (14,11,48,236921.99,'The Plum Orchard at Kamata (Kamata no umezono), from the series \"One Hundred Famous Views of Edo (Meisho Edo hyakkei)\"',NULL,1),(15,12,12,479370.29,'Skyphos (Drinking Cup)',NULL,1),(16,13,47,424884.05,'Exploratory Studies',NULL,1),(17,14,44,404203.00,'The Bedroom',NULL,1),(18,15,46,322677.39,'Exploratory Studies',NULL,1),(19,16,42,105993.35,'Saint Jerome Penitent in the Wilderness',NULL,1),(20,17,41,480053.95,'The Shower Bath',NULL,1),(21,18,33,316466.69,'Chrysanthemums and Bee, from an untitled series of Large Flowers',NULL,1),(22,19,36,400423.60,'Orange Orchids, from an untitled series of flowers',NULL,1),(23,19,40,279010.69,'Madame Roulin Rocking the Cradle (La berceuse)',NULL,1),(24,20,NULL,390925.05,'Lilies, from an untitled series of Large Flowers',NULL,1),(25,20,35,319513.60,'Hydrangea and Swallow, from an untitled series of large flowers',NULL,1),(26,21,39,58990.89,'View from Massaki of Suijin Shrine, Uchigawa Inlet, and Sekiya (Massaki hen yori Suijin no mori Uchigawa Sekiya no sato o miru zu), from the series \"One Hundred Famous Views of Edo (Meisho Edo hyakkei)\"',NULL,1),(27,22,26,155304.79,'Morning Glories and Tree-frog, from an untitled series of Large Flowers',NULL,1),(28,22,30,251121.15,'Cotton Roses and Sparrow, from an untitled series of Large Flowers',NULL,1),(29,23,47,465022.95,'The Plum Orchard at Kamata (Kamata no umezono), from the series \"One Hundred Famous Views of Edo (Meisho Edo hyakkei)\"',NULL,1),(30,24,38,211758.39,'Precincts of Kameido Tenjin Shrine (Kameido Tenjin keidai), from the series \"One Hundred Famous Views of Edo (Meisho Edo hyakkei)\"',NULL,1),(31,25,25,493282.10,'Claudine Resting',NULL,1),(32,349,34,321426.20,'Bell-Flower and Dragonfly, from an untitled series of large flowers',NULL,1),(33,874,NULL,102.00,'Pietà',NULL,1),(34,875,23,4.00,'La Java',NULL,1),(35,876,45,332081.05,'Colonnade and Gardens of the Medici Palace',NULL,1),(36,877,29,287244.69,'Poppies, from an untitled series of flowers',NULL,1),(37,878,NULL,2201.00,'Lilies, from an untitled series of Large Flowers',NULL,1),(38,879,28,107261.95,'Inwood Park',NULL,1),(39,880,3,265973.39,'Untitled',NULL,1);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `paymongo_payment_intent_id` varchar(255) NOT NULL,
  `status` enum('processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'processing',
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_address`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `shipping_carrier` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=881 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (11,22,236921.99,'link_MjyvwDGGF1j6z12FMU5dFx8C','processing','null','2025-07-25 14:15:49','2025-07-25 14:15:49',NULL,NULL),(12,22,479370.29,'link_fm6bar2nCjDJbZBVgxP85SEQ','shipped','null','2025-07-25 14:20:44','2025-07-25 14:31:35','LBC Express','3123213123'),(13,6,424884.05,'link_ag9CSN5VNqcMzyYoeVZHkeXP','processing','{\"id\":1,\"user_id\":6,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T14:32:39.000Z\",\"updated_at\":\"2025-07-25T14:32:39.000Z\"}','2025-07-25 14:33:04','2025-07-25 14:33:04',NULL,NULL),(14,13,404203.00,'link_gb6o7LKnd95iNHrBUYdFw7TY','shipped','{\"id\":2,\"user_id\":13,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T14:46:01.000Z\",\"updated_at\":\"2025-07-25T14:46:01.000Z\"}','2025-07-25 14:46:59','2025-07-28 15:00:48','LBC','12321312312'),(15,13,322677.39,'link_ZtZHWtpUXiuj7Z7w58koVoAg','shipped','{\"id\":2,\"user_id\":13,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T14:46:01.000Z\",\"updated_at\":\"2025-07-25T14:46:01.000Z\"}','2025-07-25 14:49:31','2025-07-25 17:08:52','321312','31231'),(16,15,105993.35,'link_ZZPwJUS6uV7LH7ZRCd8twSF9','shipped','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-25 15:07:15','2025-07-25 15:35:24','LBC Express','123123123'),(17,15,480053.95,'link_nKzBSuBQcWKDpqphLtp1N3K2','completed',NULL,'2025-07-25 17:07:26','2025-07-25 17:07:26',NULL,NULL),(18,18,316466.69,'link_PhFEk2VGwZoz8wGA7GMwksRB','shipped','{\"id\":4,\"user_id\":18,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T17:09:39.000Z\",\"updated_at\":\"2025-07-25T17:09:39.000Z\"}','2025-07-25 17:09:54','2025-07-25 17:10:33','3213213','3213213'),(19,15,679434.29,'link_7bp6Yo1j86TkepMDxfAWpwkA','completed','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 02:09:16','2025-07-27 02:09:16',NULL,NULL),(20,15,710438.65,'link_BSzhxTHcMbMppKQcdXFen6VX','completed','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 02:12:25','2025-07-27 02:12:25',NULL,NULL),(21,15,58990.89,'link_niQvKYaeEY8hVFu3eqDJxKW6','processing','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 02:23:41','2025-07-27 02:23:41',NULL,NULL),(22,15,406425.94,'link_qAX5wmwUMxfU8hUGrCRUPvGp','shipped','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 02:27:57','2025-07-27 04:07:37','LBC Experrss','3123123131241'),(23,15,465022.95,'link_hzf5hJXLB9rbJ3f4TceKDvjx','completed',NULL,'2025-07-27 04:04:34','2025-07-27 04:04:34',NULL,NULL),(24,15,211758.39,'link_vqqib9mXszwkFvWmjMa7u27V','shipped','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 04:06:53','2025-07-27 04:09:23','3213321','321312'),(25,15,493282.10,'link_3XJ8LXW2idRUbEaC5ffcwwfe','shipped','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}','2025-07-27 04:10:55','2025-07-27 04:11:34','LBC Express','321312312'),(349,15,321426.20,'link_6izkd7yieK89jFdD4tym8L1k','completed',NULL,'2025-07-27 18:34:55','2025-07-27 18:34:55',NULL,NULL),(874,9,102.00,'','',NULL,'2025-07-28 03:20:00','2025-07-28 03:20:00',NULL,NULL),(875,15,4.00,'','',NULL,'2025-07-28 03:20:00','2025-07-28 03:20:00',NULL,NULL),(876,21,332081.05,'link_irjBbrB2f74Sz1d7n5EK3MT5','completed',NULL,'2025-07-28 14:57:07','2025-07-28 14:57:07',NULL,NULL),(877,21,287244.69,'link_XCLkhEcwEST5VVZFngCcfgKB','processing','{\"id\":5,\"user_id\":21,\"full_name\":\"Fero\",\"phone_number\":\"09196572342\",\"street_address\":\"Quezon\",\"city\":\"Quezon\",\"province\":\"Manila\",\"postal_code\":\"1232\",\"country\":\"Philippines\",\"landmark\":\"Sa gilid ng may balutan\",\"is_default\":1,\"created_at\":\"2025-07-28T14:58:41.000Z\",\"updated_at\":\"2025-07-28T14:58:41.000Z\"}','2025-07-28 14:59:17','2025-07-28 14:59:17',NULL,NULL),(878,21,2201.00,'','',NULL,'2025-08-05 05:50:00','2025-08-05 05:50:00',NULL,NULL),(879,15,107261.95,'link_97gdk9nseUgDoR97MCVtTMCb','completed',NULL,'2025-08-05 15:27:15','2025-08-05 15:27:15',NULL,NULL),(880,15,265973.39,'link_FMJRnVayQYxbyL8o5CGVKeWp','completed',NULL,'2025-08-05 15:46:13','2025-08-05 15:46:13',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_payments`
--

DROP TABLE IF EXISTS `pending_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pending_payments` (
  `id` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `artwork_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`artwork_ids`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_address`)),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_payments`
--

LOCK TABLES `pending_payments` WRITE;
/*!40000 ALTER TABLE `pending_payments` DISABLE KEYS */;
INSERT INTO `pending_payments` VALUES ('link_1uoAjtxCbFqRWXMtu6t3yCVu',17,'[12,11]','2025-07-25 10:53:46',NULL),('link_2MxHazJfyKjXKBz6ibxQKb2d',17,'[11]','2025-07-25 11:20:14',NULL),('link_3qoDRfr2WGWadfGsuchtWDtK',17,'[30]','2025-08-22 11:55:05',NULL),('link_4F5pktNirkQcAFmMWvP98Z8r',15,'[36]','2025-07-27 01:55:51','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_4kDJm1educHqsLdvXpceJ16q',17,'[23]','2025-08-22 12:06:29',NULL),('link_4LEi2Jg7c1uomXMVismFB2AC',15,'[40]','2025-07-27 01:58:32',NULL),('link_4yi1joew18FzNKA2z91AxuuK',17,'[28]','2025-08-22 10:30:59',NULL),('link_5Bb3fCkkve1b9LGCZhm5pHdZ',17,'[12]','2025-07-25 10:37:48',NULL),('link_6MixbsyEWDLEqHp44nGP1u2b',15,'[17]','2025-08-08 00:13:21','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_A1p3UB8kYRirr8qeHLYgqmpJ',17,'[11]','2025-07-25 11:50:43',NULL),('link_ARVYwjaQSQznq4pNaMDvKaJd',17,'[11]','2025-07-25 11:45:10',NULL),('link_AvBg45PkVx2KAAc2zRVahkn3',19,'[14]','2025-08-22 12:37:26',NULL),('link_DtpVZoeY37nygQXNHDqAdGGn',17,'[11,12]','2025-07-25 11:37:48',NULL),('link_e7FiUs24fpgWTkphNh8MQpNH',17,'[11]','2025-07-25 11:17:45',NULL),('link_EiUFuG5MtooXF3H4WzRZ43rT',17,'[23]','2025-08-22 12:05:55',NULL),('link_ET9KyXPUz7aDouaKcGyHP2mS',17,'[11]','2025-07-25 10:58:03',NULL),('link_gSzeNxLuQ4sH2VuG9Hrdba94',15,'[36]','2025-07-27 01:57:43','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_hJ6tYBkhoyAnKbbzeB5Z2zw6',15,'[31,35]','2025-07-27 02:11:18','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_htpfKFyDtF2KBJoCFxKieLdX',17,'[12]','2025-07-25 11:14:04',NULL),('link_Hzh4tN8S6Ek3wwYkZqqrxu5i',15,'[40]','2025-07-27 01:54:00',NULL),('link_JBZZ2kcYNMuPHJrK5gaynhnc',15,'[31,35]','2025-07-27 02:11:11','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_Jx6wLGD9fa9m3vxujUkR3MNH',21,'[43]','2025-07-25 13:52:20','null'),('link_kcDSPfEpzfhcdat8Esn9oh3o',17,'[12]','2025-07-25 10:29:56',NULL),('link_ko7GvsLo56duZwnshmQVs7wU',15,'[36,40]','2025-07-27 02:03:02','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_LcMNdrZq6VmzcD384QwZbE6x',15,'[40]','2025-07-27 01:53:45',NULL),('link_LLvrZgLdB29CWLyhFZNbnsuK',15,'[40]','2025-07-27 02:02:05',NULL),('link_mkoEZnPwfH4nMhbctv5pXVAG',17,'[11,12]','2025-07-25 11:38:42',NULL),('link_NCMnvcFWbXxJ4BFLtaApAaUT',15,'[28]','2025-08-05 15:25:56',NULL),('link_ndfGuoNwcmh4DFK98rB1qqLi',17,'[11,12]','2025-07-25 11:22:02',NULL),('link_opKjVneaJxyWpYKW7zokkR8Q',17,'[11]','2025-07-25 11:42:58',NULL),('link_PHVNwSL6nGewAAhmRLUWYCmn',15,'[36,40]','2025-07-27 02:04:41','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_PpmKd4U2VKccEkMWPCmNyzh5',15,'[36]','2025-07-27 02:03:22','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_RFp1yoGfBFzxvEkRCEHDtnSK',17,'[12]','2025-07-25 10:27:39',NULL),('link_S8dwgzvG8bLgfHXYBc7YHAnJ',17,'[12]','2025-07-25 09:58:45',NULL),('link_sTA3w9yhYFWkPbwG1ZBNcQkx',15,'[17,37]','2025-08-11 10:44:28','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_tcuz7eBGzpCs9vZX3dGNRKUc',17,'[12]','2025-07-25 09:57:04',NULL),('link_tNbHRrXgV8h8xsJzRduQvsX1',17,'[12]','2025-07-25 10:57:26',NULL),('link_uQaMrwdE3MCk7sVh9EDLAHgD',17,'[11]','2025-07-25 11:52:20',NULL),('link_UQVpWWGmFjbfLhnbJsimQygv',17,'[11,12]','2025-07-25 11:24:04',NULL),('link_uV4k6HxBsiHUkTtLC6fb9QNG',17,'[11]','2025-07-25 11:48:12',NULL),('link_VavuQb49VD6x7HW4uG6sVizv',17,'[12]','2025-07-25 10:39:13',NULL),('link_VJLV4uqqz9B32UwCQpNpyrx1',17,'[11]','2025-07-25 11:13:17',NULL),('link_WqGfT6fTewfkM7UdLrvzou9P',15,'[36]','2025-07-27 01:58:20','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_xCcSA7Qe2de5X5FWsocqNjxb',17,'[11]','2025-07-25 11:10:18',NULL),('link_XZKsM5HYBp6t4egNPWtqREy7',17,'[11]','2025-07-25 11:01:12',NULL),('link_Y9qFAsA88WrBN6uuhtDHkYdz',17,'[11]','2025-07-25 11:05:38',NULL),('link_YKfgnagNqUbGcwkiku2pGcwu',17,'[23]','2025-08-22 12:08:30',NULL),('link_ym2DyyFcsQS2uoREBCg4Hw91',15,'[36,40]','2025-07-27 02:05:07','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_zr6MP6Ev4C9ggfX5Vw7fA9Vt',15,'[36]','2025-07-27 01:58:13','{\"id\":3,\"user_id\":15,\"full_name\":\"John Michael Roxas\",\"phone_number\":\"09916572342\",\"street_address\":\"Kapalong Talaingod Street\",\"city\":\"Valencia\",\"province\":\"Bukidnon\",\"postal_code\":\"8709\",\"country\":\"Philippines\",\"landmark\":\"Sugod\",\"is_default\":1,\"created_at\":\"2025-07-25T15:06:39.000Z\",\"updated_at\":\"2025-07-25T15:06:39.000Z\"}'),('link_ztkU2JNcgYNGHruZPu7qFkL2',17,'[11,12]','2025-07-25 11:37:02',NULL),('link_Zuf1eV9oBC5Sa8hg3JqsKxDy',17,'[12]','2025-07-25 10:23:22',NULL);
/*!40000 ALTER TABLE `pending_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_milestones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','awaiting_approval','completed','in_revision','approved') NOT NULL DEFAULT 'pending',
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `idx_milestones_status` (`status`),
  CONSTRAINT `fk_milestones_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
INSERT INTO `project_milestones` VALUES (1,2,'dsa','dsa','2025-08-19','pending',0,3000.00,'2025-08-19 08:12:24','2025-08-19 08:12:24'),(2,2,'dsa','dsa','2025-08-19','pending',0,3000.00,'2025-08-19 08:12:24','2025-08-19 08:12:24'),(3,2,'dsa','dsa','2025-08-19','pending',0,3000.00,'2025-08-19 08:12:26','2025-08-19 08:12:26'),(4,2,'dsa','dsa','2025-08-19','pending',0,3000.00,'2025-08-19 08:12:26','2025-08-19 08:12:26'),(5,2,'dsa','dsa','2025-08-19','pending',0,3000.00,'2025-08-19 08:12:26','2025-08-19 08:12:26'),(6,3,'25%','don aleady','2025-08-21','pending',0,150.00,'2025-08-21 13:51:39','2025-08-21 13:51:39'),(7,4,'done','almost done','2025-08-22','pending',0,50.00,'2025-08-22 08:16:01','2025-08-22 08:16:01'),(8,4,'done','almost done','2025-08-22','pending',0,50.00,'2025-08-22 08:16:03','2025-08-22 08:16:03');
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commission_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `final_price` decimal(10,2) NOT NULL,
  `status` enum('awaiting_payment','active','completed','on_hold','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `commission_id` (`commission_id`),
  KEY `client_id` (`client_id`),
  KEY `artist_id` (`artist_id`),
  KEY `idx_projects_status` (`status`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,2,15,10,10000.00,'active','2025-08-11 09:04:04','2025-08-11 09:04:04'),(2,1,15,10,10000.00,'active','2025-08-11 09:42:33','2025-08-11 09:42:33'),(3,3,15,10,500.00,'','2025-08-19 08:34:40','2025-08-19 08:34:40'),(4,5,17,1,50.00,'awaiting_payment','2025-08-22 07:01:27','2025-08-22 07:01:27'),(5,6,17,1,100.00,'active','2025-08-22 08:17:27','2025-08-22 14:51:29');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reviewer_id` int(11) NOT NULL,
  `reviewed_id` int(11) NOT NULL,
  `artwork_id` int(11) DEFAULT NULL,
  `commission_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `artwork_id` (`artwork_id`),
  KEY `commission_id` (`commission_id`),
  KEY `idx_reviewed_id` (`reviewed_id`),
  KEY `idx_rating` (`rating`),
  KEY `fk_reviews_orders` (`order_id`),
  CONSTRAINT `fk_reviews_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,15,4,NULL,NULL,4,'what','2025-07-27 02:09:58',19),(2,15,1,NULL,NULL,5,'dsadsa','2025-07-27 02:34:49',17),(3,15,5,35,NULL,5,'Good item','2025-07-27 02:42:22',20),(4,15,4,47,NULL,5,'talap talap','2025-07-27 04:04:50',23),(5,15,7,34,NULL,5,'Thank you','2025-07-27 18:35:14',349),(6,15,1,25,NULL,5,'Thanks\n','2025-07-27 18:35:37',25),(7,21,8,45,NULL,4,'Ampangit ng gawa mo','2025-07-28 14:57:32',876),(8,15,7,34,NULL,4,'123213','2025-08-05 08:16:17',349),(9,15,5,28,NULL,5,'Nyenyenye','2025-08-05 15:28:02',879),(10,15,5,28,NULL,3,'111','2025-08-05 15:28:20',879),(11,15,9,42,NULL,5,'yey','2025-08-21 13:42:32',16);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('skill','software') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_type_unique` (`name`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (5,'2D Animation','skill'),(10,'3D Modeling','skill'),(14,'Adobe Illustrator','software'),(13,'Adobe Photoshop','software'),(16,'Blender','software'),(1,'Character Design','skill'),(18,'Clip Studio Paint','software'),(3,'Concept Art','skill'),(8,'Digital Painting','skill'),(2,'Environment Art','skill'),(20,'Figma','software'),(4,'Illustration','skill'),(19,'Maya','software'),(12,'Motion Graphics','skill'),(6,'Pixel Art','skill'),(15,'Procreate','software'),(11,'Texturing','skill'),(7,'UI/UX Design','skill'),(9,'Vector Art','skill'),(17,'ZBrush','software');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `artwork_id` int(11) DEFAULT NULL,
  `auction_id` int(11) DEFAULT NULL,
  `commission_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('purchase','auction_win','commission_payment','refund') NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_gateway_id` varchar(255) DEFAULT NULL,
  `paymongo_payment_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `artwork_id` (`artwork_id`),
  KEY `auction_id` (`auction_id`),
  KEY `commission_id` (`commission_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_type` (`transaction_type`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_ibfk_4` FOREIGN KEY (`commission_id`) REFERENCES `commissions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `user_type` enum('artist','client','admin') DEFAULT 'artist',
  `profile_image` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `identity_verified` tinyint(1) DEFAULT 0,
  `jumio_verification_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `commission_rate` decimal(5,4) DEFAULT 0.1500,
  `availability` enum('Open','Limited','Closed') NOT NULL DEFAULT 'Open',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_verified` (`verified`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Kiana.Hansen33@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Grant Lindgren','artist','https://avatars.githubusercontent.com/u/97660295','Artificiose suppellex aggredior. Illum umquam cursus thesaurus villa ante vicissitudo vulgus solus cruciamentum. Creber clam adicio iusto cupiditate quisquam vereor pauci.','Lake Kylieburgh, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(2,'Armani12@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Everett Wintheiser','artist','https://avatars.githubusercontent.com/u/69360518','Tremo ultra asporto. Crepusculum capitulus argumentum. Cupiditas utrimque subito defaeco ulciscor umerus.','Port Rowanbury, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(3,'Zita2@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Ana Boyle','artist','https://avatars.githubusercontent.com/u/50284882','Derideo curso asperiores nihil tollo curso. Spoliatio cohaero bellicus minima repudiandae vester modi. Aestus thesaurus vitae pax verus.','Fort Lazaro, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(4,'Jeff.Johnson91@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Clifton Kiehn','artist','https://avatars.githubusercontent.com/u/78184452','Vulariter tutis iure reprehenderit ciminatio vestrum illum defendo audio voro. Claudeo vulticulus defaeco coerceo adhaero inventore dicta dolorem summisse veritas. Dolores aut aureus.','Dorianport, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(5,'Green10@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Jan Reichert','artist','https://avatars.githubusercontent.com/u/2596178','Dolore templum dolorem traho paulatim. Spargo adnuo verecundia caterva universe despecto hic inflammatio speciosus candidus. Cresco accedo vomica vere cumque vulticulus.','Beaverton, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(6,'Buddy.Rodriguez32@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Marcos Harris','artist','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/43.jpg','Statua fuga numquam ad theatrum vorax aegrotatio apparatus apparatus. Vulpes ratione consectetur sulum audeo tego. Timor eius umerus aiunt coadunatio nemo tyrannus.','Lake Jasen, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(7,'Nyasia_Keebler12@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Marian Emmerich','artist','https://avatars.githubusercontent.com/u/67698500','Bibo atqui tui veritatis culpa terra cum vulnero uter. Combibo curtus vacuus. Pauci tricesimus tandem valeo uberrime tenax.','Adeleside, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(8,'Jerome.Koelpin-Larson25@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Mr. Ben Ortiz','artist','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/90.jpg','Volubilis agnitio laborum arto umquam laborum nesciunt. Texo adsuesco tres vetus adsuesco sublime cogito adaugeo dignissimos calco. Altus uter vix barba comprehendo demens tracto consuasor stillicidium.','Leannonfort, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(9,'Jordi_Bogisich@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Jan Windler DDS','artist','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/70.jpg','Pax corona vado summopere absque astrum tribuo conqueror quae. Tui volo vitium mollitia accusamus absconditus. Dicta videlicet approbo decipio cognomen victoria aranea arx.','Carmel, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(10,'Cornell_Rice-Roob24@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Lucy Heidenreich','artist','https://avatars.githubusercontent.com/u/28869912','Tollo arto valeo tamdiu avarus tricesimus volaticus ubi. Atqui explicabo arca. Tabgo conqueror caelum astrum texo corroboro succurro similique creptio.','Ebertfield, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(11,'Haley.Batz46@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Jo Spinka','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/27.jpg','Tamquam suffragium vos aro amiculum. Voluntarius tepesco calcar denuncio tamdiu. Ater utique quasi.','North Willard, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(12,'Chance_Weissnat-Kling@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Edgar Bogan','client','https://avatars.githubusercontent.com/u/47475366','Thymbra cras defluo solutio arguo vel triduana. Agnitio rerum animi cumque. Compello appello reiciendis averto magnam cum cena nesciunt.','Otishaven, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(13,'Kitty_Koss12@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Marty Kuhic','client','https://avatars.githubusercontent.com/u/74505861','Somniculosus dolorum vociferor demo auxilium sperno. Aurum acerbitas cunctatio vae necessitatibus confero. Ipsum numquam sulum vulnero.','Cornelltown, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(14,'Kavon_Rice@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Geneva Ankunding','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/74.jpg','Absorbeo vinco absque tristis combibo vestrum. Tergiversatio vester tabesco alo coerceo trado. Vindico coaegresco vox succedo culpa curriculum.','Toms River, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(15,'Thea_Willms@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Ms. Hazel Thompson','client','https://avatars.githubusercontent.com/u/20506652','Clam ipsa cognatus et spes. Excepturi deorsum placeat aliquid dedico temperantia ventito. Suspendo terror patrocinor vinum aperte.','Xanderhaven, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(16,'Mikayla.Yost11@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Angelica Franecki','client','https://avatars.githubusercontent.com/u/90575750','Nemo defleo desparatus. Victus tui verbera. Strenuus vinitor tutamen architecto consequuntur.','Denver, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(17,'Angelita_Harris@yahoo.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Kay Wunsch MD','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/67.jpg','Adulatio adinventitias patria substantia pauper curvo amet id. Casso pecco vetus aro. Apud totidem adfero attonbitus suspendo stillicidium amissio uxor fuga.','North Alta, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(18,'Vidal_Grimes68@hotmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Earnest Emard','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/78.jpg','Canonicus depulso ipsa demoror totam voro compello degenero. Verumtamen adfero ceno cubicularis sonitus tamdiu abutor natus ipsa fugiat. Combibo ubi perspiciatis carcer sustineo depromo claudeo ducimus aqua.','West Vidafurt, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(19,'Roberta.Weissnat76@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Darryl West','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/83.jpg','Unus cumque quam terminatio. Verto commemoro aiunt cursus voluptas. Cilicium patior quia corpus thema sub claustrum velociter patior.','Salt Lake City, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open'),(20,'Nolan.Johnston@gmail.com','$2a$10$UO8ud.Lv0J/Wbh05P2m30Ogouhc7pS4YNtP.VKdJiRYNcEsCE7S2q','Mark Morar','client','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/64.jpg','Vilis conscendo repellendus facilis coepi cohaero truculenter. Agnitio patrocinor cruciamentum vigilo. Defaeco tepesco accommodo.','South Rodolfochester, Philippines',NULL,1,NULL,0,NULL,'2025-08-22 02:10:31','2025-08-22 02:10:31',0.1500,'Open');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchlists`
--

DROP TABLE IF EXISTS `watchlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `watchlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `auction_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_auction_unique` (`user_id`,`auction_id`),
  KEY `watchlists_ibfk_2` (`auction_id`),
  CONSTRAINT `watchlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watchlists_ibfk_2` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchlists`
--

LOCK TABLES `watchlists` WRITE;
/*!40000 ALTER TABLE `watchlists` DISABLE KEYS */;
INSERT INTO `watchlists` VALUES (2,15,2,'2025-07-27 11:00:07');
/*!40000 ALTER TABLE `watchlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wishlist_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `artwork_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_artwork` (`user_id`,`artwork_id`),
  KEY `wishlist_items_ibfk_2` (`artwork_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES (2,3,13,'2025-07-25 12:24:35'),(7,17,46,'2025-07-25 13:34:04'),(9,1,48,'2025-07-25 14:44:39'),(31,15,37,'2025-08-05 17:23:32');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-24 17:33:59
