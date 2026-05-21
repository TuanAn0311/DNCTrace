-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 14, 2026 lúc 06:05 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `dnc_trace`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blockchain_records`
--

CREATE TABLE `blockchain_records` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `hash` varchar(66) NOT NULL,
  `tx_hash` varchar(66) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `blockchain_records`
--

INSERT INTO `blockchain_records` (`id`, `product_id`, `hash`, `tx_hash`, `created_at`) VALUES
(1, 2, '0x89ea0cb4ecf2bf94a9899581c57b124d38a312e9317b3c3d5fac9a668e1e6a4f', '0x9210d26dc4498c5429345f74c5748aa35e19aabfe20414bb1c7c4342dc3af73c', '2026-04-25 08:29:48'),
(2, 1, '0x40fbf89694e6b134daf345837a26c9d541bdc5ce69fc3dcfb3e7a6caab8633c6', '0x89d57183f0c653f873bc90dff2f0346a4b42894f9798ca2883d8abb22e0d8577', '2026-04-25 08:30:58'),
(3, 2, '0x89ea0cb4ecf2bf94a9899581c57b124d38a312e9317b3c3d5fac9a668e1e6a4f', '0xfe57a8b0e857cad83d0fa9a891c25ba47f3ea0edec6e763f6a358a2207845498', '2026-04-26 14:26:19'),
(4, 1, '0x40fbf89694e6b134daf345837a26c9d541bdc5ce69fc3dcfb3e7a6caab8633c6', '0x6f9fd1549c4be7f9a43b34e74c26c51602923e408b86aaf78aaaabefa6e16d1a', '2026-04-26 14:26:27'),
(5, 2, '0x89ea0cb4ecf2bf94a9899581c57b124d38a312e9317b3c3d5fac9a668e1e6a4f', '0x6def10e91ebeaec28d2d580941ecfcbf3d744f130b0663de15aad898d4af99fb', '2026-04-27 13:18:08'),
(6, 1, '0x40fbf89694e6b134daf345837a26c9d541bdc5ce69fc3dcfb3e7a6caab8633c6', '0xdc4e1eafced189b9860c02f006ac0f71a60925c65e80f9ce1eeda7c3e7e63fd0', '2026-04-27 13:18:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_method` enum('COD','QR') DEFAULT 'COD',
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `full_name`, `phone`, `address`, `total_price`, `payment_method`, `status`, `created_at`) VALUES
(1, 2, 'tuanan', '0974134027', '122 vku', 180000.00, 'COD', 'delivered', '2026-04-26 14:12:47'),
(2, 1, 'tuanan', '0974134027', '122 vku', 750000.00, 'COD', 'delivered', '2026-04-26 14:39:53'),
(3, 1, 'tuanan', '0974134027', '122 vku', 360000.00, 'QR', 'delivered', '2026-04-26 14:58:39'),
(4, 2, 'tuanan', '0974134027', '122 vku', 250000.00, 'QR', 'delivered', '2026-05-05 09:52:16'),
(5, 2, 'tuanan', '0974134027', '122 vku', 1080000.00, 'QR', 'delivered', '2026-05-08 02:04:18'),
(6, 1, 'bà già nổi loạn', '097412323', '105 HAHA, Mỹ An, Đà Nẵng', 1260000.00, 'COD', 'pending', '2026-05-12 03:28:27'),
(7, 4, 'Đoàn Quang Tuấn An', '0123455666', '123 Hàm Nghi, Hải Châu, Đà Nẵng', 1080000.00, 'QR', 'pending', '2026-05-12 05:18:29'),
(8, 4, 'Đoàn Quang Tuấn An', '0123455666', '123 Hàm Nghi, Hải Châu, Đà Nẵng', 1510000.00, 'COD', 'shipped', '2026-05-12 05:26:59'),
(9, 4, 'Đoàn Quang Tuấn An', '0123455666', '123 Hàm Nghi, Hải Châu, Đà Nẵng', 1260000.00, 'QR', 'delivered', '2026-05-12 05:27:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_details`
--

CREATE TABLE `order_details` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_details`
--

INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 2, 1, 180000.00),
(2, 2, 1, 3, 250000.00),
(3, 3, 2, 2, 180000.00),
(4, 4, 1, 1, 250000.00),
(5, 5, 6, 1, 1080000.00),
(6, 6, 2, 1, 180000.00),
(7, 6, 7, 1, 1080000.00),
(8, 7, 7, 1, 1080000.00),
(9, 8, 1, 1, 250000.00),
(10, 8, 2, 1, 180000.00),
(11, 8, 7, 1, 1080000.00),
(12, 9, 2, 1, 180000.00),
(13, 9, 7, 1, 1080000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `stock` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `image`, `description`, `origin`, `created_at`, `stock`, `status`) VALUES
(1, 'Cà phê Arabica Cầu Đất', 250000.00, 'https://tse3.mm.bing.net/th/id/OIP._VRX3IU_Ml1nEsmSYheZBQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', 'Cà phê 100% Arabica rang mộc từ vùng Cầu Đất, Đà Lạt.', 'Trang trại DNC Farm, Đà Lạt', '2026-04-24 16:18:16', 1, 1),
(2, 'Cà phê Robusta Buôn Ma Thuột', 180000.00, 'https://th.bing.com/th/id/OIP.8rxLDlyOrw-UESzxFcAmqQHaHa?w=126&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', 'Cà phê Robusta nguyên chất từ Buôn Ma Thuột, hương vị đậm đà, mạnh mẽ, phù hợp cho người thích cà phê truyền thống.', 'Buôn Ma Thuột, Đắk Lắk', '2026-04-25 08:10:58', 1, 1),
(3, 'Cà phê Arabica Đà Lạt', 120000.00, 'https://capheom.com/wp-content/uploads/2022/07/ca-phe-hat-arabica-da-lat-02-1279x1536.jpg', 'Cà phê nguyên chất, rang mộc, hương thơm dịu nhẹ', 'Đà Lạt, Lâm Đồng', '2026-04-28 09:37:04', 0, 1),
(7, 'Cà phê chồn Legendee Trung Nguyên – 225gr', 1080000.00, 'https://trungnguyencoffeevn.com/wp-content/uploads/2018/09/3.2.jpg', 'ngon lắm nha', 'Tây Nguyên', '2026-05-08 02:42:03', 0, 1),
(11, 'Cà Phê Chồn Đắk Lắk', 850000.00, 'https://banfb.vn/wp-content/uploads/2024/07/Chua-co-ten-Bai-dang-Facebook-11-duoc-xoa-nen-3.png', 'Cà phê chồn nổi tiếng với hương thơm đặc biệt, vị êm và hậu vị kéo dài.', 'Đắk Lắk, Việt Nam', '2026-05-13 01:04:20', 0, 1),
(12, 'Cà Phê Arabica Sơn La', 210000.00, 'https://mocchaufood.vn/wp-content/uploads/2024/08/ca-phe-aratay-a.jpg', 'Arabica vùng núi Tây Bắc có vị chua nhẹ, hương trái cây và mùi thơm thanh.', 'Sơn La, Việt Nam', '2026-05-13 01:04:20', 0, 1),
(13, 'Cà Phê Culi Robusta', 175000.00, 'https://product.hstatic.net/200000427201/product/culi-ecom_hat_rang_1kg_-_01_329e33d66aac4a63ab63987b8ab0da3a.png', 'Hạt cà phê Culi rang đậm, vị mạnh, đắng sâu và hàm lượng caffeine cao.', 'Gia Lai, Việt Nam', '2026-05-13 01:04:20', 0, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `rating`, `comment`, `created_at`) VALUES
(1, 4, 2, 5, 'ngon lắm', '2026-05-12 10:19:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `supply_chain`
--

CREATE TABLE `supply_chain` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `stage` varchar(100) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `supply_chain`
--

INSERT INTO `supply_chain` (`id`, `product_id`, `stage`, `data`, `created_at`) VALUES
(1, 1, 'Thu hoạch', '{\"note\":\"Hái tay 100% trái chín tại nông trại Tuan An\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:00:31'),
(2, 1, 'Chế Biến và rang xay', '{\"note\":\"rang mộc nhiệt độ 180 độ C\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:01:10'),
(3, 1, 'Đóng gói', '{\"note\":\"hút chân không, gián tem nhãn\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:01:39'),
(4, 2, 'Thu Hoạch', '{\"note\":\"hái tay 100%\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:13:10'),
(5, 2, 'chế biến và rang xay', '{\"note\":\"phơi nắng tự nhiên và rang 180 độ C\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:13:44'),
(6, 2, 'đóng gói', '{\"note\":\"hút chân không và dán tem\",\"updated_by\":\"Admin DNC\"}', '2026-04-25 08:14:05'),
(7, 1, 'thu hoạch', '{\"note\":\"thu hoạch hoàn toàn bằng tay \",\"updated_by\":\"Admin DNC\",\"txHash\":\"0x3adced10f8368fb925903e5d2186f8582254ef94beaeacc93757da0a4ee546bc\"}', '2026-04-28 09:40:31'),
(8, 1, 'đóng gói', '{\"note\":\"hút chân không\",\"updated_by\":\"Admin DNC\",\"txHash\":\"0x73a6b8505dd966a66f844e33620ed852db4ec0ac07f43082c5de7233d7678939\"}', '2026-04-28 09:52:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `provider` enum('local','google') DEFAULT 'local',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone`, `avatar`, `role`, `provider`, `created_at`) VALUES
(1, 'admin@gmail.com', '$2b$10$jllKBSjfeWzx12Lpq5b9t.9kD3UAQ8fp1trG538EY9kvoYLcQ/ZzK', 'Admin', '0987654321', NULL, 'user', 'local', '2026-04-24 15:06:41'),
(2, 'admin1@gmail.com', '$2b$10$0kDZr5nH9hlrzrdTswpiCetxzr1UQzlI3Zn2wWK2zvp0lIwkXvcGW', 'Admin DNC', '0987654321', NULL, 'admin', 'local', '2026-04-24 16:03:28'),
(3, 'superadmin@gmail.com', '$2b$10$wNAXThJ1nNjyzYzw/.Aeoe0igQ3t/wHJwwOJ8n6nJus5XS99dVwFm', 'Boss DNC', '0999999999', NULL, 'admin', 'local', '2026-04-24 16:11:34'),
(4, 'andqt.23it@vku.udn.vn', '$2b$10$47oFvfgvmx2YPYlHSA5jeu6E7wCqIK4qazBZrIAE6aD1soNgl0kWW', 'Đoàn Quang Tuấn An', NULL, NULL, 'user', 'local', '2026-05-12 05:15:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address_line` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `full_name`, `phone`, `address_line`, `city`, `district`, `is_default`) VALUES
(1, 1, 'Tuấn An', '0974134027', '107 Ngũ Hành Sơn', 'Đà Nẵng', 'Mỹ An', 0),
(2, 1, 'Tuấn An', '0974134027', '107 Ngũ Hành Sơn', 'Đà Nẵng', 'Ngũ Hành Sơn', 0),
(3, 1, 'bà già nổi loạn', '097412323', '105 HAHA', 'Đà Nẵng', 'Mỹ An', 1),
(4, 4, 'Đoàn Quang Tuấn An', '0123455666', '123 Hàm Nghi', 'Đà Nẵng', 'Hải Châu', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `blockchain_records`
--
ALTER TABLE `blockchain_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_item` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `order_details`
--
ALTER TABLE `order_details`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `supply_chain`
--
ALTER TABLE `supply_chain`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `blockchain_records`
--
ALTER TABLE `blockchain_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `order_details`
--
ALTER TABLE `order_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `supply_chain`
--
ALTER TABLE `supply_chain`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `blockchain_records`
--
ALTER TABLE `blockchain_records`
  ADD CONSTRAINT `blockchain_records_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `supply_chain`
--
ALTER TABLE `supply_chain`
  ADD CONSTRAINT `supply_chain_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
