-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 24, 2017 at 08:12 AM
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
-- Table structure for table `cht_users`
--

CREATE TABLE `cht_users` (
  `id` int(11) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_slug` text,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(60) DEFAULT NULL,
  `contact_no` varchar(30) DEFAULT NULL,
  `invited_ids` text COMMENT 'Comma seperated User IDs',
  `options` mediumtext COMMENT 'Options or settings related to the particular user',
  `status` int(2) DEFAULT '1' COMMENT '0-Inactive, 1-Active, 2-Deleted',
  `created_on` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `cht_users`
--

INSERT INTO `cht_users` (`id`, `user_name`, `user_slug`, `password`, `email`, `contact_no`, `invited_ids`, `options`, `status`, `created_on`) VALUES
(1, 'Jai', 'jai', '', 'jai@sourceplate.com', '9566041710', '', '{"themeClr":"rgba(158, 158, 158, 1)"}', 1, '2017-02-20 10:28:08'),
(2, 'Ranjith', 'ranjith', '12345', 'rranjithravichandran@gmail.com', '9629795623', '', '{"themeClr":"rgba(0, 188, 212, 1)"}', 1, '2017-02-20 11:39:01'),
(3, 'Ranjith Ravi', 'ranjith_ravi', '12345', 'rranjithravichandran@gmail.com', '9629795623', '', '{"themeClr":"rgba(15, 157, 88, 1)"}', 1, '2017-02-20 11:39:12'),
(4, 'Rajesh', 'rajesh', 'rajesh86', NULL, NULL, '', '{"themeClr":"rgba(96, 125, 139, 1)"}', 1, '2017-02-18 15:33:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cht_users`
--
ALTER TABLE `cht_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cht_users`
--
ALTER TABLE `cht_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
