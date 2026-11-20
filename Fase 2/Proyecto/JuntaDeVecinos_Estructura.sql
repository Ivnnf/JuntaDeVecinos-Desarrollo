CREATE DATABASE  IF NOT EXISTS `auth_core_desarrollo_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `auth_core_desarrollo_db`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: auth_core_desarrollo_db
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comunicaciones_adjuntopublicacion`
--

DROP TABLE IF EXISTS `comunicaciones_adjuntopublicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicaciones_adjuntopublicacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archivo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_subida` datetime(6) NOT NULL,
  `publicacion_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comunicaciones_adjun_publicacion_id_b20fad14_fk_comunicac` (`publicacion_id`),
  CONSTRAINT `comunicaciones_adjun_publicacion_id_b20fad14_fk_comunicac` FOREIGN KEY (`publicacion_id`) REFERENCES `comunicaciones_publicacion` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comunicaciones_conversacion`
--

DROP TABLE IF EXISTS `comunicaciones_conversacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicaciones_conversacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `asunto` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `activa` tinyint(1) NOT NULL,
  `directiva_id` bigint NOT NULL,
  `vecino_id` bigint NOT NULL,
  `cerrada_por_id` bigint DEFAULT NULL,
  `fecha_cierre` datetime(6) DEFAULT NULL,
  `rol_cierre` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comunicaciones_conve_directiva_id_31779d69_fk_organizac` (`directiva_id`),
  KEY `comunicaciones_conve_vecino_id_9da6c545_fk_profiles_` (`vecino_id`),
  KEY `comunicaciones_conve_cerrada_por_id_a282cac1_fk_profiles_` (`cerrada_por_id`),
  CONSTRAINT `comunicaciones_conve_cerrada_por_id_a282cac1_fk_profiles_` FOREIGN KEY (`cerrada_por_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `comunicaciones_conve_directiva_id_31779d69_fk_organizac` FOREIGN KEY (`directiva_id`) REFERENCES `organizacion_directiva` (`id`),
  CONSTRAINT `comunicaciones_conve_vecino_id_9da6c545_fk_profiles_` FOREIGN KEY (`vecino_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comunicaciones_mensaje`
--

DROP TABLE IF EXISTS `comunicaciones_mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicaciones_mensaje` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contenido` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_envio` datetime(6) NOT NULL,
  `leido` tinyint(1) NOT NULL,
  `fecha_lectura` datetime(6) DEFAULT NULL,
  `conversacion_id` bigint NOT NULL,
  `remitente_id` bigint NOT NULL,
  `rol_remitente` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comunicaciones_mensa_conversacion_id_1606a430_fk_comunicac` (`conversacion_id`),
  KEY `comunicaciones_mensa_remitente_id_68a58f87_fk_profiles_` (`remitente_id`),
  CONSTRAINT `comunicaciones_mensa_conversacion_id_1606a430_fk_comunicac` FOREIGN KEY (`conversacion_id`) REFERENCES `comunicaciones_conversacion` (`id`),
  CONSTRAINT `comunicaciones_mensa_remitente_id_68a58f87_fk_profiles_` FOREIGN KEY (`remitente_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comunicaciones_notificacion`
--

DROP TABLE IF EXISTS `comunicaciones_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicaciones_notificacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `leida` tinyint(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_lectura` datetime(6) DEFAULT NULL,
  `publicacion_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notificacion_publicacion_usuario` (`publicacion_id`,`usuario_id`),
  KEY `comunicaciones_notif_usuario_id_18b790ce_fk_profiles_` (`usuario_id`),
  CONSTRAINT `comunicaciones_notif_publicacion_id_36bb9c7c_fk_comunicac` FOREIGN KEY (`publicacion_id`) REFERENCES `comunicaciones_publicacion` (`id`),
  CONSTRAINT `comunicaciones_notif_usuario_id_18b790ce_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comunicaciones_publicacion`
--

DROP TABLE IF EXISTS `comunicaciones_publicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comunicaciones_publicacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_publicacion` datetime(6) NOT NULL,
  `activa` tinyint(1) NOT NULL,
  `autor_id` bigint NOT NULL,
  `directiva_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comunicaciones_publi_autor_id_abda1ae8_fk_profiles_` (`autor_id`),
  KEY `comunicaciones_publi_directiva_id_fab3bec9_fk_organizac` (`directiva_id`),
  CONSTRAINT `comunicaciones_publi_autor_id_abda1ae8_fk_profiles_` FOREIGN KEY (`autor_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `comunicaciones_publi_directiva_id_fab3bec9_fk_organizac` FOREIGN KEY (`directiva_id`) REFERENCES `organizacion_directiva` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_profiles_usuario_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_profiles_usuario_id` FOREIGN KEY (`user_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventos_asistenciaevento`
--

DROP TABLE IF EXISTS `eventos_asistenciaevento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_asistenciaevento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `inscripcion_id` bigint NOT NULL,
  `registrado_por_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inscripcion_id` (`inscripcion_id`),
  KEY `eventos_asistenciaev_registrado_por_id_253c249d_fk_profiles_` (`registrado_por_id`),
  CONSTRAINT `eventos_asistenciaev_inscripcion_id_4bd02096_fk_eventos_i` FOREIGN KEY (`inscripcion_id`) REFERENCES `eventos_inscripcionevento` (`id`),
  CONSTRAINT `eventos_asistenciaev_registrado_por_id_253c249d_fk_profiles_` FOREIGN KEY (`registrado_por_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventos_evento`
--

DROP TABLE IF EXISTS `eventos_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_evento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `lugar` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` datetime(6) NOT NULL,
  `fecha_fin` datetime(6) DEFAULT NULL,
  `cupo_maximo` int unsigned DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `creador_id` bigint NOT NULL,
  `directiva_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `eventos_evento_creador_id_6cb29976_fk_profiles_usuario_id` (`creador_id`),
  KEY `eventos_evento_directiva_id_e4968831_fk_organizac` (`directiva_id`),
  CONSTRAINT `eventos_evento_creador_id_6cb29976_fk_profiles_usuario_id` FOREIGN KEY (`creador_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `eventos_evento_directiva_id_e4968831_fk_organizac` FOREIGN KEY (`directiva_id`) REFERENCES `organizacion_directiva` (`id`),
  CONSTRAINT `eventos_evento_chk_1` CHECK ((`cupo_maximo` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventos_inscripcionevento`
--

DROP TABLE IF EXISTS `eventos_inscripcionevento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_inscripcionevento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inscripcion` datetime(6) NOT NULL,
  `fecha_cancelacion` datetime(6) DEFAULT NULL,
  `evento_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inscripcion_evento_usuario` (`evento_id`,`usuario_id`),
  KEY `eventos_inscripcione_usuario_id_8be090f4_fk_profiles_` (`usuario_id`),
  CONSTRAINT `eventos_inscripcione_evento_id_2f5fa215_fk_eventos_e` FOREIGN KEY (`evento_id`) REFERENCES `eventos_evento` (`id`),
  CONSTRAINT `eventos_inscripcione_usuario_id_8be090f4_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_cargo`
--

DROP TABLE IF EXISTS `organizacion_cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_cargo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permite_multiples` tinyint(1) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_directiva`
--

DROP TABLE IF EXISTS `organizacion_directiva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_directiva` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacion` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `junta_vecinos_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizacion_directi_junta_vecinos_id_b473dd13_fk_organizac` (`junta_vecinos_id`),
  CONSTRAINT `organizacion_directi_junta_vecinos_id_b473dd13_fk_organizac` FOREIGN KEY (`junta_vecinos_id`) REFERENCES `organizacion_juntavecinos` (`id`),
  CONSTRAINT `ck_directiva_fechas_validas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_integrantedirectiva`
--

DROP TABLE IF EXISTS `organizacion_integrantedirectiva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_integrantedirectiva` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL,
  `cargo_id` bigint NOT NULL,
  `directiva_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizacion_integra_cargo_id_fb520c78_fk_organizac` (`cargo_id`),
  KEY `organizacion_integra_directiva_id_1c50466d_fk_organizac` (`directiva_id`),
  KEY `organizacion_integra_usuario_id_f9329e57_fk_profiles_` (`usuario_id`),
  CONSTRAINT `organizacion_integra_cargo_id_fb520c78_fk_organizac` FOREIGN KEY (`cargo_id`) REFERENCES `organizacion_cargo` (`id`),
  CONSTRAINT `organizacion_integra_directiva_id_1c50466d_fk_organizac` FOREIGN KEY (`directiva_id`) REFERENCES `organizacion_directiva` (`id`),
  CONSTRAINT `organizacion_integra_usuario_id_f9329e57_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `ck_integrante_directiva_fechas_validas` CHECK (((`fecha_fin` is null) or (`fecha_fin` >= `fecha_inicio`)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_juntavecinos`
--

DROP TABLE IF EXISTS `organizacion_juntavecinos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_juntavecinos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comuna` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `activa` tinyint(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_sector`
--

DROP TABLE IF EXISTS `organizacion_sector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_sector` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `junta_vecinos_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizacion_sector_junta_vecinos_id_f5b2daec_fk_organizac` (`junta_vecinos_id`),
  CONSTRAINT `organizacion_sector_junta_vecinos_id_f5b2daec_fk_organizac` FOREIGN KEY (`junta_vecinos_id`) REFERENCES `organizacion_juntavecinos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizacion_verificacionresidencia`
--

DROP TABLE IF EXISTS `organizacion_verificacionresidencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizacion_verificacionresidencia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_extraido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_extraida` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_documento_extraida` date DEFAULT NULL,
  `confianza_ocr` decimal(5,2) DEFAULT NULL,
  `observacion_automatica` longtext COLLATE utf8mb4_unicode_ci,
  `fecha_revision` datetime(6) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `revisado_por_id` bigint DEFAULT NULL,
  `sector_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  `comuna_extraida` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hash_archivo` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento_duplicado` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `organizacion_verific_revisado_por_id_09235605_fk_profiles_` (`revisado_por_id`),
  KEY `organizacion_verific_sector_id_a4216b65_fk_organizac` (`sector_id`),
  KEY `organizacion_verific_usuario_id_31bea715_fk_profiles_` (`usuario_id`),
  KEY `organizacion_verificacionresidencia_hash_archivo_9d95d9f1` (`hash_archivo`),
  CONSTRAINT `organizacion_verific_revisado_por_id_09235605_fk_profiles_` FOREIGN KEY (`revisado_por_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `organizacion_verific_sector_id_a4216b65_fk_organizac` FOREIGN KEY (`sector_id`) REFERENCES `organizacion_sector` (`id`),
  CONSTRAINT `organizacion_verific_usuario_id_31bea715_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_caracterizacioncomunitaria`
--

DROP TABLE IF EXISTS `profiles_caracterizacioncomunitaria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_caracterizacioncomunitaria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad_personas_hogar` smallint unsigned NOT NULL,
  `cantidad_menores_18` smallint unsigned NOT NULL,
  `cantidad_adultos_mayores` smallint unsigned NOT NULL,
  `nivel_educacional` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `situacion_laboral` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_vivienda` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acceso_internet` tinyint(1) DEFAULT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `profiles_caracteriza_usuario_id_28ba9bdd_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `profiles_caracterizacioncomunitaria_chk_1` CHECK ((`cantidad_personas_hogar` >= 0)),
  CONSTRAINT `profiles_caracterizacioncomunitaria_chk_2` CHECK ((`cantidad_menores_18` >= 0)),
  CONSTRAINT `profiles_caracterizacioncomunitaria_chk_3` CHECK ((`cantidad_adultos_mayores` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_historialgestionusuario`
--

DROP TABLE IF EXISTS `profiles_historialgestionusuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_historialgestionusuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo_cambio` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_anterior` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor_nuevo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detalle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_cambio` datetime(6) NOT NULL,
  `realizado_por_id` bigint NOT NULL,
  `usuario_objetivo_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `profiles_historialge_realizado_por_id_9d919bc0_fk_profiles_` (`realizado_por_id`),
  KEY `profiles_historialge_usuario_objetivo_id_2dd6efb5_fk_profiles_` (`usuario_objetivo_id`),
  CONSTRAINT `profiles_historialge_realizado_por_id_9d919bc0_fk_profiles_` FOREIGN KEY (`realizado_por_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `profiles_historialge_usuario_objetivo_id_2dd6efb5_fk_profiles_` FOREIGN KEY (`usuario_objetivo_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_perfil`
--

DROP TABLE IF EXISTS `profiles_perfil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_perfil` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` int DEFAULT NULL,
  `comuna_id` int DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jdv` int DEFAULT NULL,
  `imagen_1` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_2` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagen_o_doc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cargo_id` int NOT NULL,
  `rol_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  UNIQUE KEY `rut` (`rut`),
  KEY `profiles_perfil_rol_id_25b5f830_fk_profiles_rol_id` (`rol_id`),
  CONSTRAINT `profiles_perfil_rol_id_25b5f830_fk_profiles_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `profiles_rol` (`id`),
  CONSTRAINT `profiles_perfil_usuario_id_f90af99f_fk_profiles_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_rol`
--

DROP TABLE IF EXISTS `profiles_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_rol` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_usuario`
--

DROP TABLE IF EXISTS `profiles_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `apellido_materno` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido_paterno` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmado_por_usuario_id` bigint DEFAULT NULL,
  `estado_asociacion_sector` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_confirmacion_sector` datetime(6) DEFAULT NULL,
  `sector_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `rut` (`rut`),
  KEY `profiles_usuario_confirmado_por_usuar_73f6823e_fk_profiles_` (`confirmado_por_usuario_id`),
  KEY `profiles_usuario_sector_id_728b4fa3_fk_organizacion_sector_id` (`sector_id`),
  CONSTRAINT `profiles_usuario_confirmado_por_usuar_73f6823e_fk_profiles_` FOREIGN KEY (`confirmado_por_usuario_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `profiles_usuario_sector_id_728b4fa3_fk_organizacion_sector_id` FOREIGN KEY (`sector_id`) REFERENCES `organizacion_sector` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_usuario_groups`
--

DROP TABLE IF EXISTS `profiles_usuario_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_usuario_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_usuario_groups_usuario_id_group_id_d29261a9_uniq` (`usuario_id`,`group_id`),
  KEY `profiles_usuario_groups_group_id_1e4011a2_fk_auth_group_id` (`group_id`),
  CONSTRAINT `profiles_usuario_gro_usuario_id_ddd4115a_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `profiles_usuario_groups_group_id_1e4011a2_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_usuario_user_permissions`
--

DROP TABLE IF EXISTS `profiles_usuario_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_usuario_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_usuario_user_pe_usuario_id_permission_id_57125549_uniq` (`usuario_id`,`permission_id`),
  KEY `profiles_usuario_use_permission_id_6945c7b2_fk_auth_perm` (`permission_id`),
  CONSTRAINT `profiles_usuario_use_permission_id_6945c7b2_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `profiles_usuario_use_usuario_id_27b1f776_fk_profiles_` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles_usuariorol`
--

DROP TABLE IF EXISTS `profiles_usuariorol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles_usuariorol` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_asignacion` datetime(6) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `rol_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_rol` (`usuario_id`,`rol_id`),
  KEY `profiles_usuariorol_rol_id_26e22919_fk_profiles_rol_id` (`rol_id`),
  CONSTRAINT `profiles_usuariorol_rol_id_26e22919_fk_profiles_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `profiles_rol` (`id`),
  CONSTRAINT `profiles_usuariorol_usuario_id_29ac3258_fk_profiles_usuario_id` FOREIGN KEY (`usuario_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_historialsolicituddocumento`
--

DROP TABLE IF EXISTS `solicitudes_historialsolicituddocumento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_historialsolicituddocumento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado_anterior` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario_respuesta` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_cambio` datetime(6) NOT NULL,
  `solicitud_id` bigint NOT NULL,
  `usuario_responsable_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_historia_solicitud_id_5cb0dbd5_fk_solicitud` (`solicitud_id`),
  KEY `solicitudes_historia_usuario_responsable__709c56c8_fk_profiles_` (`usuario_responsable_id`),
  CONSTRAINT `solicitudes_historia_solicitud_id_5cb0dbd5_fk_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_solicituddocumento` (`id`),
  CONSTRAINT `solicitudes_historia_usuario_responsable__709c56c8_fk_profiles_` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_historialsolicitudvecino`
--

DROP TABLE IF EXISTS `solicitudes_historialsolicitudvecino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_historialsolicitudvecino` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado_anterior` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario_respuesta` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_cambio` datetime(6) NOT NULL,
  `solicitud_id` bigint NOT NULL,
  `usuario_responsable_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_historia_solicitud_id_09dcd551_fk_solicitud` (`solicitud_id`),
  KEY `solicitudes_historia_usuario_responsable__ba3a82a4_fk_profiles_` (`usuario_responsable_id`),
  CONSTRAINT `solicitudes_historia_solicitud_id_09dcd551_fk_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_solicitudvecino` (`id`),
  CONSTRAINT `solicitudes_historia_usuario_responsable__ba3a82a4_fk_profiles_` FOREIGN KEY (`usuario_responsable_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_solicituddocumento`
--

DROP TABLE IF EXISTS `solicitudes_solicituddocumento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_solicituddocumento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `numero_seguimiento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_actual` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_solicitud` datetime(6) NOT NULL,
  `fecha_resolucion` datetime(6) DEFAULT NULL,
  `junta_vecinos_id` bigint NOT NULL,
  `responsable_id` bigint DEFAULT NULL,
  `tipo_documento_id` bigint NOT NULL,
  `vecino_id` bigint NOT NULL,
  `fecha_ultima_revision_vecino` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_seguimiento` (`numero_seguimiento`),
  KEY `solicitudes_solicitu_junta_vecinos_id_99495cf3_fk_organizac` (`junta_vecinos_id`),
  KEY `solicitudes_solicitu_responsable_id_96319a5c_fk_profiles_` (`responsable_id`),
  KEY `solicitudes_solicitu_tipo_documento_id_ac4d2709_fk_solicitud` (`tipo_documento_id`),
  KEY `solicitudes_solicitu_vecino_id_7592d585_fk_profiles_` (`vecino_id`),
  CONSTRAINT `solicitudes_solicitu_junta_vecinos_id_99495cf3_fk_organizac` FOREIGN KEY (`junta_vecinos_id`) REFERENCES `organizacion_juntavecinos` (`id`),
  CONSTRAINT `solicitudes_solicitu_responsable_id_96319a5c_fk_profiles_` FOREIGN KEY (`responsable_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `solicitudes_solicitu_tipo_documento_id_ac4d2709_fk_solicitud` FOREIGN KEY (`tipo_documento_id`) REFERENCES `solicitudes_tipodocumento` (`id`),
  CONSTRAINT `solicitudes_solicitu_vecino_id_7592d585_fk_profiles_` FOREIGN KEY (`vecino_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_solicituddocumentoarchivo`
--

DROP TABLE IF EXISTS `solicitudes_solicituddocumentoarchivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_solicituddocumentoarchivo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `archivo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_uso` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_subida` datetime(6) NOT NULL,
  `solicitud_id` bigint NOT NULL,
  `subido_por_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_solicitu_solicitud_id_987a2393_fk_solicitud` (`solicitud_id`),
  KEY `solicitudes_solicitu_subido_por_id_db48447f_fk_profiles_` (`subido_por_id`),
  CONSTRAINT `solicitudes_solicitu_solicitud_id_987a2393_fk_solicitud` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_solicituddocumento` (`id`),
  CONSTRAINT `solicitudes_solicitu_subido_por_id_db48447f_fk_profiles_` FOREIGN KEY (`subido_por_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_solicitudvecino`
--

DROP TABLE IF EXISTS `solicitudes_solicitudvecino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_solicitudvecino` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `junta_vecinos_id` bigint NOT NULL,
  `vecino_id` bigint NOT NULL,
  `fecha_respuesta` datetime(6) DEFAULT NULL,
  `respondido_por_id` bigint DEFAULT NULL,
  `respuesta` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_ultima_revision_vecino` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitudes_solicitu_junta_vecinos_id_2298b291_fk_organizac` (`junta_vecinos_id`),
  KEY `solicitudes_solicitu_vecino_id_c1321659_fk_profiles_` (`vecino_id`),
  KEY `solicitudes_solicitu_respondido_por_id_0d04d33a_fk_profiles_` (`respondido_por_id`),
  CONSTRAINT `solicitudes_solicitu_junta_vecinos_id_2298b291_fk_organizac` FOREIGN KEY (`junta_vecinos_id`) REFERENCES `organizacion_juntavecinos` (`id`),
  CONSTRAINT `solicitudes_solicitu_respondido_por_id_0d04d33a_fk_profiles_` FOREIGN KEY (`respondido_por_id`) REFERENCES `profiles_usuario` (`id`),
  CONSTRAINT `solicitudes_solicitu_vecino_id_c1321659_fk_profiles_` FOREIGN KEY (`vecino_id`) REFERENCES `profiles_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solicitudes_tipodocumento`
--

DROP TABLE IF EXISTS `solicitudes_tipodocumento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_tipodocumento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-14 22:46:22
