-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 16, 2017 at 02:28 PM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.6.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `cht_chats`
--

CREATE TABLE `cht_chats` (
  `id` int(11) NOT NULL,
  `msg_from` int(11) DEFAULT NULL COMMENT 'By which user',
  `msg_to` int(11) DEFAULT NULL COMMENT 'To which group',
  `msg` longtext,
  `created_on` datetime DEFAULT NULL,
  `status` int(2) DEFAULT '1' COMMENT '0-Inactive, 1-Active, 2-Deleted'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cht_groups`
--

CREATE TABLE `cht_groups` (
  `id` int(11) NOT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `group_slug` text,
  `group_members_id` text COMMENT 'Comma separated user ids',
  `created_by` int(11) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `status` int(2) DEFAULT NULL COMMENT '0-Inactive, 1-Active, 2-Deleted'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cht_users`
--

CREATE TABLE `cht_users` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_slug` text,
  `password` varchar(255) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `email` varchar(60) DEFAULT NULL,
  `contact_no` varchar(30) DEFAULT NULL,
  `status` int(2) DEFAULT '1' COMMENT '0-Inactive, 1-Active, 2-Deleted',
  `created_on` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cht_chats`
--
ALTER TABLE `cht_chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cht_groups`
--
ALTER TABLE `cht_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cht_users`
--
ALTER TABLE `cht_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cht_chats`
--
ALTER TABLE `cht_chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `cht_groups`
--
ALTER TABLE `cht_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `cht_users`
--
ALTER TABLE `cht_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
