-- PostgreSQL dump (converted from MySQL)
-- Database: ecom_db

SET client_encoding = 'UTF8';

-- ===== DROP ALL TABLES =====
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS cart_reminder_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_stats CASCADE;
DROP TABLE IF EXISTS product_likes CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS promotion_banners CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===== CREATE TABLES (dependency order) =====

-- Table: users
CREATE TABLE users (
  id BIGSERIAL,
  create_at TIMESTAMP DEFAULT NULL,
  deleted_at TIMESTAMP DEFAULT NULL,
  email varchar(100) NOT NULL,
  full_name varchar(100) NOT NULL,
  password varchar(255) NOT NULL,
  phone varchar(15) DEFAULT NULL,
  role VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  username varchar(50) DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UK6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email),
  CONSTRAINT UKr43af9ap4edm43mmtq01oddj6 UNIQUE (username)
);

-- Table: categories
CREATE TABLE categories (
  id BIGSERIAL,
  deleted_at TIMESTAMP DEFAULT NULL,
  description varchar(1000) DEFAULT NULL,
  name varchar(100) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UKt8o6pivur7nn124jehx7cygw5 UNIQUE (name)
);

-- Table: products
CREATE TABLE products (
  id BIGSERIAL,
  created_at TIMESTAMP DEFAULT NULL,
  deleted_at TIMESTAMP DEFAULT NULL,
  description varchar(500) DEFAULT NULL,
  image_url varchar(300) DEFAULT NULL,
  is_active BOOLEAN DEFAULT NULL,
  name varchar(255) NOT NULL,
  price DECIMAL(38,2) NOT NULL,
  stock_quantity BIGINT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  category_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FKog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Table: addresses
CREATE TABLE addresses (
  id BIGSERIAL,
  address_line varchar(255) NOT NULL,
  city varchar(255) NOT NULL,
  district varchar(255) NOT NULL,
  is_default BOOLEAN DEFAULT NULL,
  user_id BIGINT NOT NULL,
  deleted_at TIMESTAMP DEFAULT NULL,
  phone varchar(15) NOT NULL,
  recipient_name varchar(100) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK1fa36y2oqhao3wgg2rw1pi459 FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Table: carts
CREATE TABLE carts (
  id BIGSERIAL,
  created_at TIMESTAMP DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UK64t7ox312pqal3p7fg9o503c2 UNIQUE (user_id),
  CONSTRAINT FKb5o626f86h46m4s7ms6ginnop FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Table: banners
CREATE TABLE banners (
  id BIGSERIAL,
  is_active BOOLEAN NOT NULL,
  badge_icon VARCHAR(50) DEFAULT NULL,
  badge_text varchar(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NULL,
  description text,
  display_order INTEGER NOT NULL,
  end_date TIMESTAMP DEFAULT NULL,
  image_url varchar(500) NOT NULL,
  link_url varchar(500) DEFAULT NULL,
  overlay_color varchar(100) DEFAULT NULL,
  start_date TIMESTAMP DEFAULT NULL,
  subtitle varchar(255) DEFAULT NULL,
  title varchar(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (id)
);

-- Table: promotion_banners
CREATE TABLE promotion_banners (
  id BIGSERIAL,
  is_active BOOLEAN NOT NULL,
  bg_color varchar(100) DEFAULT NULL,
  coupon_code varchar(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NULL,
  description text,
  discount_label varchar(100) DEFAULT NULL,
  display_order INTEGER NOT NULL,
  end_date TIMESTAMP DEFAULT NULL,
  link_url varchar(500) DEFAULT NULL,
  start_date TIMESTAMP DEFAULT NULL,
  title varchar(255) NOT NULL,
  PRIMARY KEY (id)
);

-- Table: cart_items
CREATE TABLE cart_items (
  id BIGSERIAL,
  quantity INTEGER NOT NULL,
  cart_id BIGINT DEFAULT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK1re40cjegsfvw58xrkdp6bac6 FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT FKpcttvuq4mxppo8sxggjtn5i2c FOREIGN KEY (cart_id) REFERENCES carts (id)
);

-- Table: coupons
CREATE TABLE coupons (
  id BIGSERIAL,
  active BOOLEAN DEFAULT NULL,
  code varchar(50) NOT NULL,
  created_at DATE DEFAULT NULL,
  deleted_at TIMESTAMP DEFAULT NULL,
  discount_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(38,2) NOT NULL,
  expiration_date DATE NOT NULL,
  max_discount_amount DECIMAL(38,2) DEFAULT NULL,
  min_order_value DECIMAL(38,2) DEFAULT NULL,
  start_date DATE NOT NULL,
  usage_limit INTEGER NOT NULL,
  used_count INTEGER DEFAULT NULL,
  promotion_type VARCHAR(50) NOT NULL,
  category_id BIGINT DEFAULT NULL,
  product_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UKeplt0kkm9yf2of2lnx6c1oy9b UNIQUE (code),
  CONSTRAINT FK1y4bgwwy6k404u0dv4jfi1wb4 FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT FKsywuemw12y5s03cupsj3mjs3b FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Table: orders
CREATE TABLE orders (
  id BIGSERIAL,
  created_at TIMESTAMP DEFAULT NULL,
  discount_amount DECIMAL(38,2) DEFAULT NULL,
  fullname varchar(255) NOT NULL,
  note varchar(255) DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  phone_number varchar(20) NOT NULL,
  shipping_address text NOT NULL,
  status VARCHAR(50) DEFAULT NULL,
  sub_total DECIMAL(38,2) NOT NULL,
  total_money DECIMAL(38,2) NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK32ql8ubntj5uh44ph9659tiih FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Table: order_details
CREATE TABLE order_details (
  id BIGSERIAL,
  price DECIMAL(38,2) NOT NULL,
  quantity INTEGER NOT NULL,
  order_id BIGINT DEFAULT NULL,
  product_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK4q98utpd73imf4yhttm3w0eax FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT FKjyu2qbqt8gnvno9oe9j2s2ldk FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- Table: payments
CREATE TABLE payments (
  id BIGSERIAL,
  amount DECIMAL(38,2) NOT NULL,
  gateway_response_json text,
  note varchar(255) DEFAULT NULL,
  payment_date TIMESTAMP DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  transaction_reference varchar(255) DEFAULT NULL,
  order_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UKrwn36natqiwaseu5c3jvaun3 UNIQUE (transaction_reference),
  CONSTRAINT FK81gagumt0r8y3rmudcgpbk42l FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT payments_chk_1 CHECK (amount >= 0)
);

-- Table: product_images
CREATE TABLE product_images (
  id BIGSERIAL,
  image_url varchar(500) NOT NULL,
  product_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FKqnq71xsohugpqwf3c9gxmsuy FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Table: product_likes
CREATE TABLE product_likes (
  id BIGSERIAL,
  created_at TIMESTAMP DEFAULT NULL,
  product_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UK712hmqku6f5l2q28jql7vj0f5 UNIQUE (user_id,product_id),
  CONSTRAINT FK795q9hiytbh68mn8om6hmxpoa FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT FK8cbn21ikwcvtgr8lkaspdhgpo FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Table: product_stats
CREATE TABLE product_stats (
  product_id BIGINT NOT NULL,
  avg_rating DECIMAL(3,2) NOT NULL,
  rating_distribution text,
  total_reviews BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT FKqawohfr96evam9fw5pt69rata FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Table: reviews
CREATE TABLE reviews (
  id BIGSERIAL,
  comment text,
  created_at TIMESTAMP DEFAULT NULL,
  rating INTEGER NOT NULL,
  product_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content text NOT NULL,
  rejection_reason varchar(500) DEFAULT NULL,
  report_count INTEGER NOT NULL,
  seller_reply text,
  seller_reply_at TIMESTAMP DEFAULT NULL,
  status VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT NULL,
  order_detail_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT UKpdoxdvhk6k612mlg4cdpr6rgn UNIQUE (order_detail_id),
  CONSTRAINT FKa6fy7npl2qi9nu2fo9igepm9k FOREIGN KEY (order_detail_id) REFERENCES order_details (id),
  CONSTRAINT FKcgy7qjc1r99dp117y9en6lxye FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT FKpl51cejpw4gy5swfar8br9ngi FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT reviews_chk_1 CHECK ((rating >= 1 AND rating <= 5))
);

-- Table: cart_reminder_logs
CREATE TABLE cart_reminder_logs (
  id BIGSERIAL,
  sent_at TIMESTAMP NOT NULL,
  cart_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK2ca3yay8sm5xx8t1qh258i914 FOREIGN KEY (cart_id) REFERENCES carts (id),
  CONSTRAINT FKl7gheg147te52t346po2tg27a FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Table: coupon_usages
CREATE TABLE coupon_usages (
  id BIGSERIAL,
  discount_amount DECIMAL(38,2) NOT NULL,
  used_at TIMESTAMP DEFAULT NULL,
  coupon_id BIGINT NOT NULL,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FK3mvslb8gc0ac6501mfmvifgva FOREIGN KEY (coupon_id) REFERENCES coupons (id),
  CONSTRAINT FK6mev6grxbqmt8l0jxvobfg70n FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT FKs9yuckyrsqcsgmjsus1unapt4 FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- ===== INSERT DATA (dependency order) =====

-- Data: users
INSERT INTO users VALUES (1,'2026-03-09 11:49:31.218425',NULL,'admin@gmail.com','Quản Trị Viên Dz','$2a$10$GC07zfdCV503fKnla4YHR.jWUp7C.FH2uYmfOvhj3emvukll8Ym3W','0971760562','ADMIN','2026-04-09 08:35:43.574874',NULL),(2,'2026-03-09 11:49:32.422991',NULL,'đo.dung@gmail.com','Đinh Hữu Minh Long','$2a$10$ndqBQKNzt.OA4KqHgf.snutO4J1GxT/Xr31TcCWL6AG/6On2bukza',NULL,'USER','2026-03-09 11:49:32.422991',NULL),(3,'2026-03-09 11:49:32.576722',NULL,'nguyenvana@example.com','Nguyễn Văn A','$2a$10$KQzXFd/DN7WW5mYoLc8m3eJRg.7/bhPkfs.XWekVDCJQEuqnq9xYy','0901234567','USER','2026-03-12 10:44:05.045560','nguyenva12312312312312na'),(4,'2026-03-09 11:49:32.729753',NULL,'ha.son@yahoo.com','Mai Hoàng Lê Trinh','$2a$10$pWQJEHi.kO/mTHsC94rqo.bWLqho9byKgbUqfIqkpVgJIquGpbcdG',NULL,'USER','2026-03-09 11:49:32.729753',NULL),(5,'2026-03-09 11:49:32.864923',NULL,'tran.phan@gmail.com','Hoàng Vân Hồ Tuân est','$2a$10$x8OWK.e0qt4WkQabt362JOqbvBTlblvrUXVuuV1D2DhdrYfsMjfkS','0971760561','USER','2026-03-22 22:09:26.162281',NULL),(6,'2026-03-09 11:49:32.992677',NULL,'đao.vu@gmail.com','Đào Nam Trung','$2a$10$ywNo2ncXjVxHVSwOEi.Ipej7qqMRo/8fAepcF0e1XBFIY9sKjBAFe',NULL,'USER','2026-03-09 11:49:32.992677',NULL),(7,'2026-03-09 11:49:33.119545',NULL,'le.huu@gmail.com','Đào Tăng Tô Hòa','$2a$10$iVbKAfEDBGnY3XFGNEK/JOIJI7QNw94k1nKVhX4l53gk1Ra/k1DO2',NULL,'USER','2026-03-09 11:49:33.120566',NULL),(8,'2026-03-09 11:49:33.247117',NULL,'to.to@gmail.com','Vũ Phùng Văn Như','$2a$10$zjm47d3.Bj8F5tSDMDZM4OdGOw8Xv.xF7bShVDo75CeO6XAXff1TS',NULL,'USER','2026-03-09 11:49:33.247117',NULL),(9,'2026-03-09 11:49:33.371550',NULL,'le.hoa@yahoo.com','Lý Ngọc Văn','$2a$10$w3fgdvwWgjIe.uQ4nFUNYu584IRgWAFSj8VIoZFsWc/LG.24818Ja',NULL,'USER','2026-03-09 11:49:33.371550',NULL),(10,'2026-03-09 11:49:33.496035',NULL,'đao.hai@hotmail.com','Đỗ Vinh Minh','$2a$10$MYKRxRM275BlDZ4ZHN5o4OnNOmpVtrE.bN0E9MU62qWtUek/IK1Xi',NULL,'USER','2026-03-09 11:49:33.496035',NULL),(11,'2026-03-09 11:49:33.614294',NULL,'bui.phan@hotmail.com','Hồ Tâm','$2a$10$E78Nf50zvVm.sp7hmS/rauufZFFEEilxM/6856CvMonF6kclbGK8O',NULL,'USER','2026-03-09 11:49:33.614294',NULL),(12,'2026-03-11 16:42:27.755692',NULL,'ptyn.18904111@gmail.com','Nga beo','$2a$10$l8FJOyLhNvcGcvWMDU7GOuLjMvyNO.zdosdn4edjgA0mxK/nyIV7i',NULL,'USER','2026-03-11 16:42:27.755692',NULL),(13,'2026-03-11 18:57:42.533833',NULL,'vanádfasda.new@example.com','Nguyễn Văn A Cập Nhật','$2a$10$6AmSyQYeSNYwiou.xGqEAuJIPOUqOQpX/A3mS2gsbFozzKPUsFl9O','0909090909','USER','2026-03-11 18:57:47.969039','nguyenvana_updated'),(14,'2026-03-12 09:46:25.146923',NULL,'pquangdung188@gmail.com','update4','$2a$10$qskfltTaEJ.E616UxaIdRO8BLBg3pWScxpHWyZVU8AkO3V4Dg4gci','0971760561','ADMIN','2026-03-12 09:46:25.146923','meomeo'),(15,'2026-04-08 10:10:31.317400',NULL,'admin123123@gmail.com','123123','$2a$10$PLUA68adQ2gYxDTJMR0.IO18e12RPGP6GK9CQFb2aUvvJBt1V4/n2',NULL,'USER','2026-04-08 10:10:31.317400',NULL);


-- Data: categories
INSERT INTO categories VALUES (1,NULL,'Các món nước nóng hổi, đậm đà, phù hợp cho bữa chính và dễ ăn mỗi ngày.','Món Nước'),(2,NULL,'Các món cơm và món mặn no bụng, chuẩn vị gia đình Việt.','Cơm & Món Chính'),(3,NULL,'Các món ăn nhanh, ăn vặt tiện lợi nhưng vẫn giữ hương vị hấp dẫn.','Đồ Ăn Nhanh & Ăn Vặt'),(4,NULL,'Nhóm đồ uống giải khát và món tráng miệng ngọt nhẹ, dễ thưởng thức.','Đồ Uống & Tráng Miệng');


-- Data: products
INSERT INTO products VALUES (1,'2026-04-09 06:18:24.000000',NULL,'Nước dùng hầm xương bò nhiều giờ cho vị ngọt thanh tự nhiên, bánh phở mềm dai và thịt bò tái lăn vừa chín tới. Món ăn mang hương vị gia truyền, ấm bụng và dễ ăn cho mọi thời điểm trong ngày.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690432/pi23ipovb6qjcytwd5b8.jpg',TRUE,'Phở Bò Truyền Thống',55000.00,118,'2026-04-12 10:22:53.549654',1),(2,'2026-04-09 06:18:24.000000',NULL,'Bún bò chuẩn vị Huế với mùi sả thơm nồng, chút mắm ruốc đặc trưng, nước dùng đậm đà cay nhẹ. Ăn kèm chả cua dai giòn và móng giò béo ngậy, rất hợp cho người thích món nước đậm vị.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690444/wqtmf9fls9ntkpf7xaph.jpg',TRUE,'Bún Bò Huế',60000.00,91,'2026-04-12 10:22:53.543392',1),(3,'2026-04-09 06:18:24.000000',NULL,'Sợi hủ tiếu dai mềm, nước dùng thanh ngọt từ xương và hải sản, kết hợp tôm, mực tươi và thịt bằm xào tỏi thơm lừng. Hương vị nhẹ nhàng, dễ ăn nhưng vẫn rất tròn vị.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690506/to8yrooplavvflpyhghf.png',TRUE,'Hủ Tiếu Nam Vang',50000.00,95,'2026-04-12 10:22:53.545950',1),(4,'2026-04-09 06:18:24.000000',NULL,'Nước dùng chua thanh từ cà chua và giấm bỗng, riêu cua béo bùi, đậu phụ chiên vàng và rau sống tươi xanh. Món ăn cân bằng vị giác, phù hợp cho bữa trưa thanh đạm mà vẫn no bụng.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690639/hbeqnxdmfoculquk3kgc.jpg',TRUE,'Bún Riêu Cua',45000.00,106,'2026-04-12 10:22:53.548456',1),(5,'2026-04-09 06:18:24.000000',NULL,'Sợi mì nghệ vàng óng, thịt ếch rim đậm vị, thơm mùi hành tỏi và tiêu. Ăn kèm rau mầm, bánh tráng nướng giòn và chút nước dùng xâm xấp đúng kiểu miền Trung.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690698/euznxg1ao5mf2agydzam.jpg',TRUE,'Mì Quảng Ếch',65000.00,80,'2026-04-09 06:24:37.105680',1),(6,'2026-04-09 06:18:24.000000',NULL,'Cơm tấm nóng dẻo ăn cùng sườn nướng than hoa thơm lừng, bì heo dai giòn và chả trứng mềm béo. Chan thêm nước mắm tỏi ớt chua ngọt là tròn vị đúng chuẩn Sài Gòn.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690746/fvlsj3c1gv5qgpgjbtcu.jpg',TRUE,'Cơm Tấm Sườn Bì Chả',60000.00,128,'2026-04-09 10:55:10.462063',2),(7,'2026-04-09 06:18:24.000000',NULL,'Hạt cơm tơi xốp rang trên chảo lớn, quyện với tôm, mực và rau củ cắt hạt lựu. Món ăn thơm mùi chảo, vị vừa miệng, thích hợp cho người thích cơm rang đậm đà.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690780/vfgegyhzqstukfarx2a8.jpg',TRUE,'Cơm Chiên Hải Sản',70000.00,89,'2026-04-09 10:42:45.766478',2),(8,'2026-04-09 06:18:24.000000',NULL,'Đùi gà xối mỡ vàng giòn bên ngoài nhưng thịt bên trong vẫn mềm mọng, ăn cùng cơm rang nghệ thơm nhẹ. Đi kèm nước tương tỏi ớt và đồ chua giúp món ăn không bị ngấy.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690810/rypfgaiw7crk53o8ujlc.jpg',TRUE,'Cơm Gà Xối Mỡ',55000.00,105,'2026-04-09 06:26:32.799151',2),(9,'2026-04-09 06:18:24.000000',NULL,'Thịt ba chỉ kho mềm rục trong nước màu óng đẹp, trứng cút thấm vị mặn ngọt hài hòa. Hương vị thân thuộc, rất hợp dùng cùng cơm nóng cho bữa ăn gia đình.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690868/luxyxicgvz6nnhb3pfoe.jpg',TRUE,'Thịt Kho Tàu Trứng Cút',45000.00,84,'2026-04-09 06:41:48.092699',2),(10,'2026-04-09 06:18:24.000000',NULL,'Cá lóc thịt chắc kho tộ với tiêu đen, ớt hiểm và nước màu keo sánh, dậy mùi hấp dẫn. Đây là món mặn cực kỳ đưa cơm, mang phong vị dân dã miền quê.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690885/xxgltzryy1w5nqk2ghj2.webp',TRUE,'Cá Lóc Kho Tộ',50000.00,72,'2026-04-09 10:23:36.441042',2),(11,'2026-04-09 06:18:24.000000',NULL,'Đế bánh mỏng giòn, phủ phô mai mozzarella béo ngậy cùng tôm, mực và xốt cà chua thơm dịu. Một món ăn nhanh hiện đại nhưng vẫn rất hợp khẩu vị số đông.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690917/u98svibopxkfklou6fyv.jpg',TRUE,'Pizza Hải Sản Phô Mai',120000.00,58,'2026-04-09 10:23:36.443039',3),(12,'2026-04-09 06:18:24.000000',NULL,'Combo 3 miếng gà rán với lớp vỏ giòn rụm, phủ bột cay nhẹ kích thích vị giác. Thịt gà bên trong mềm mọng, phù hợp cho bữa ăn nhanh hoặc ăn cùng bạn bè.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690939/fnz0ceei9wujpzo8zack.jpg',TRUE,'Gà Rán Giòn Cay',85000.00,1,'2026-04-09 10:28:30.100329',3),(13,'2026-04-09 06:18:24.000000',NULL,'Rau xà lách tươi giòn, ức gà luộc mềm ẩm, thêm cà chua bi và sốt mè rang béo bùi. Món ăn healthy thanh đạm, phù hợp cho người đang ăn cân bằng hoặc tập luyện.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690969/m83osklqog4ff0shyiqm.jpg',TRUE,'Salad Ức Gà Xốt Mè Rang',65000.00,70,'2026-04-09 06:29:10.667335',3),(14,'2026-04-09 06:18:24.000000',NULL,'Bánh mì giòn xốp, kẹp thịt nướng sả đậm đà, pate gan béo nhẹ, đồ chua và rau thơm. Món ăn nhanh quen thuộc nhưng luôn hấp dẫn nhờ hương vị hài hòa.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775690987/p9azhtuqk8jcllt8fwu8.jpg',TRUE,'Bánh Mì Thịt Nướng',30000.00,150,'2026-04-09 06:29:28.700779',3),(15,'2026-04-09 06:18:24.000000',NULL,'Tôm luộc đỏ au, thịt ba chỉ thái mỏng, bún tươi và rau sống được cuốn gọn trong lớp bánh tráng mềm. Dùng kèm tương chấm bùi béo, thanh mát và rất dễ ăn.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691009/ekkblnskauhotvrh7qru.jpg',TRUE,'Gỏi Cuốn Tôm Thịt',35000.00,140,'2026-04-09 06:29:51.562702',3),(16,'2026-04-09 06:18:24.000000',NULL,'Trà đen thơm dịu hòa cùng sữa tươi béo nhẹ, kết hợp trân châu đường đen dẻo dai ngọt vừa. Thức uống được nhiều khách hàng yêu thích nhờ vị đậm nhưng không gắt.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691029/eucuni1okcxbabwlg2rq.jpg',TRUE,'Trà Sữa Trân Châu Đường Đen',45000.00,180,'2026-04-09 06:30:09.672796',4),(17,'2026-04-09 06:18:24.000000',NULL,'Cà phê Robusta pha phin đậm đà, hòa cùng sữa đặc béo thơm và đá viên mát lạnh. Hương vị quen thuộc giúp tỉnh táo và rất hợp để dùng buổi sáng.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691049/rorf7hcqtr8rbfckujuc.jpg',TRUE,'Cà Phê Sữa Đá',25000.00,200,'2026-04-09 06:30:31.024587',4),(18,'2026-04-09 06:18:24.000000',NULL,'Nước ép dưa hấu tươi nguyên chất, vị ngọt thanh tự nhiên, mát lạnh và dễ uống. Phù hợp để giải nhiệt và bổ sung nước trong những ngày thời tiết nóng.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691076/d4xntt69q4psjdm7apba.jpg',TRUE,'Nước Ép Dưa Hấu',30000.00,160,'2026-04-09 06:30:59.103995',4),(19,'2026-04-09 06:18:24.000000',NULL,'Đậu xanh mềm bùi, cùi bưởi giòn sần sật không đắng, chan cùng nước cốt dừa sánh béo. Món tráng miệng truyền thống có vị ngọt vừa và kết cấu rất thú vị.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691100/ohyji6kcywkzfsnvlo2l.jpg',TRUE,'Chè Bưởi Cốt Dừa',25000.00,120,'2026-04-09 06:31:23.764765',4),(20,'2026-04-09 06:18:24.000000',NULL,'Bánh flan mềm mịn làm từ trứng và sữa tươi, phủ lớp caramel thơm nhẹ hơi đăng đắng. Món tráng miệng đơn giản nhưng dễ chiều lòng nhiều thực khách.','https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775691125/f6wrwx0axdalzmnlx7cp.webp',TRUE,'Bánh Flan Caramel',20000.00,130,'2026-04-09 06:31:43.660542',4);


-- Data: addresses
INSERT INTO addresses VALUES (1,'122 Đường ABC, Phường XYZ','TP. Hồ Chí Minh','Quận 1',TRUE,3,'2026-03-12 11:08:10.000000','0901234567','Nguyễn Văn A 12312'),(2,'123 Đường ABC, Phường XYZ','TP. Hồ Chí Minh','Quận 1',TRUE,3,NULL,'0901234567','Nguyễn Văn A dia chi 2'),(3,'123 Đường ABC, Phường XYZ','TP. Hồ Chí Minh','Quận 1',TRUE,3,NULL,'0901234567','Nguyễn Văn A dia chi 3'),(4,'số 1','Hà Nội','Hà Đông',TRUE,5,NULL,'0971760561','tao'),(5,'123 Main St','HCM','District 1',TRUE,1,NULL,'0901234567','admin'),(6,'số 2','Hà Nội','Hà Nội',TRUE,5,NULL,'0971760561','tao 2'),(7,'heheheh',' ha noi','ha dong',TRUE,5,NULL,'0971760561','dia chi 3'),(8,'ádfasd','123123','123123',TRUE,5,NULL,'0971760561','dia chi 3'),(9,'heheheh',' ha noi','ha dong',TRUE,5,NULL,'0971760561','dia chi 3'),(10,'heheheh',' ha noi','ha dong',TRUE,5,NULL,'0971760561','dia chi 4'),(11,'ha noi','bac giang','ha noi',TRUE,14,NULL,'0971760561','tao'),(12,'bac giang','sai gon','kien giang',TRUE,14,NULL,'0971760561','me may'),(13,'heheheh',' ha noi','ha dong',TRUE,1,NULL,'0971760561','dia chi 3');


-- Data: carts
INSERT INTO carts VALUES (1,'2026-03-09 11:49:34.035238','2026-03-09 11:49:34.035238',2),(2,'2026-03-09 11:49:34.146555','2026-03-09 11:49:34.146555',3),(3,'2026-03-09 11:49:34.177479','2026-03-09 11:49:34.177479',4),(4,'2026-03-09 11:49:34.242684','2026-03-09 11:49:34.242684',5),(5,'2026-03-09 11:49:34.293649','2026-03-09 11:49:34.293649',6),(6,'2026-03-09 11:49:34.324949','2026-03-09 11:49:34.324949',7),(7,'2026-03-09 11:49:34.382241','2026-03-09 11:49:34.382241',8),(8,'2026-03-09 11:49:34.465883','2026-03-09 11:49:34.465883',9),(9,'2026-03-09 11:49:34.529646','2026-03-09 11:49:34.529646',10),(10,'2026-03-09 11:49:34.621509','2026-03-09 11:49:34.621509',11),(11,'2026-03-11 16:38:53.826385','2026-04-09 09:22:33.000000',1),(12,'2026-03-18 19:16:02.841447','2026-03-18 19:16:02.843391',14);


-- Data: banners
INSERT INTO banners VALUES (2,TRUE,'FLAME','Đậm đà','2026-04-08 08:00:40.797773','Nước dùng trong veo, ngọt thanh từ xương hầm 12 giờ cùng quế, hồi, thảo quả thơm nồng.',0,NULL,'https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775610037/qc3ddpx0sr68sqmmuuvj.jpg',NULL,'from-red-500/80',NULL,'Tinh hoa ẩm thực Việt','Phở Bò Gia Truyền','2026-04-09 07:36:44.123028'),(3,TRUE,'STAR','Best Seller','2026-04-08 08:09:40.317211','Nước dùng thanh ngọt từ xương ống, đậm đà vị mắm ruốc Huế chuẩn vị cung đình',2,NULL,'https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775610585/eclnku4247wjsumr1fj3.jpg',NULL,'from-red-500/80',NULL,'Hương vị truyền thống','Bún bò Huế','2026-04-09 07:35:28.917011'),(4,TRUE,'FLAME','Giòn nóng','2026-04-08 08:33:41.346284','Thịt nướng thơm lừng trên than hồng, kết hợp cùng đồ chua giòn ngọt và nước sốt đặc chế đậm đà.',3,NULL,'https://res.cloudinary.com/dgxvoyfyv/image/upload/v1775695046/aab4ozeffcsuowtdb9mw.jpg',NULL,'from-amber-500/80',NULL,'Bánh Mì Thịt Nướng','Bánh mì thịt nướng','2026-04-09 07:37:57.343029');


-- Data: promotion_banners
INSERT INTO promotion_banners VALUES (5,TRUE,'bg-white/15','MONNUOC20','2026-04-09 06:53:50.235558','Áp dụng cho tất cả món nước (Đơn tối thiểu 60K)','Giảm 20%',0,NULL,NULL,NULL,'Món nước'),(6,TRUE,'bg-white/15','COMTRUA30','2026-04-09 06:56:20.107919','Áp dụng cho các món thuộc danh mục cơm & món chính (đơn tối thiểu 80K)','Giảm 30K',1,NULL,NULL,NULL,'Cơm trưa'),(7,TRUE,'bg-white/15','KHAITRUONG30','2026-04-09 06:57:32.960014','Giảm 30K cho đơn hàng đầu tiên (đơn hàng tối thiểu 50k)','Giảm 30K',2,NULL,NULL,NULL,'Khách hàng mới');


-- Data: cart_items
INSERT INTO cart_items VALUES (89,1,4,6),(90,1,4,7);


-- Data: coupons
INSERT INTO coupons VALUES (1,TRUE,'GIAM50K_UPDATE','2026-03-09','2026-04-09 06:47:30.000000','FIXED_AMOUNT',60000.00,'2026-12-31',60000.00,250000.00,'2026-03-09',500,0,'ORDER',NULL,NULL),(2,TRUE,'GIAM20PT','2026-03-09','2026-03-11 18:59:29.000000','PERCENTAGE',20.00,'2026-03-24',30000.00,100000.00,'2026-02-27',50,0,'CATEGORY',NULL,NULL),(3,TRUE,'GIAM50K3','2026-03-09','2026-04-09 06:48:09.000000','FIXED_AMOUNT',50000.00,'2026-04-30',50000.00,200000.00,'2026-03-09',100,1,'ORDER',NULL,NULL),(4,TRUE,'GIAM50K31','2026-03-11','2026-04-09 06:48:07.000000','FIXED_AMOUNT',50000.00,'2026-04-30',50000.00,200000.00,'2026-03-09',100,0,'ORDER',NULL,NULL),(5,TRUE,'SALE20PT','2026-03-11','2026-04-09 06:48:10.000000','PERCENTAGE',20.00,'2026-05-01',30000.00,100000.00,'2026-03-09',50,1,'ORDER',NULL,NULL),(6,TRUE,'TEST123','2026-03-12','2026-04-09 06:48:12.000000','PERCENTAGE',15.00,'2026-12-31',30000.00,100000.00,'2026-03-12',50,0,'CATEGORY',NULL,NULL),(7,TRUE,'MONNUOC20','2026-04-09',NULL,'PERCENTAGE',20.00,'2026-09-09',20000.00,60000.00,'2026-04-08',100,0,'CATEGORY',1,NULL),(8,TRUE,'123','2026-04-09','2026-04-09 06:52:05.000000','FIXED_AMOUNT',123.00,'2029-11-11',0.00,123.00,'2026-04-08',100,0,'ORDER',NULL,NULL),(9,TRUE,'COMTRUA30','2026-04-09',NULL,'FIXED_AMOUNT',30000.00,'2027-11-11',0.00,80000.00,'2026-04-08',100,0,'CATEGORY',2,NULL),(10,TRUE,'KHAITRUONG30','2026-04-09',NULL,'FIXED_AMOUNT',30000.00,'2027-11-11',0.00,50000.00,'2026-04-08',100,0,'ORDER',NULL,NULL);


-- Data: orders
INSERT INTO orders VALUES (1,'2026-03-10 06:36:48.000000',0.00,'Nguyễn Văn An','Giao giờ trưa','COD','0901000001','12 Nguyễn Trãi, Quận 1, TP.HCM','COMPLETED',55000.00,55000.00,1),(2,'2026-03-12 06:36:48.000000',0.00,'Trần Minh Khoa','Ít hành','COD','0901000002','25 Lê Lợi, Quận 1, TP.HCM','COMPLETED',60000.00,60000.00,2),(3,'2026-03-13 06:36:48.000000',0.00,'Lê Hoài Nam',NULL,'COD','0901000003','18 Hai Bà Trưng, Quận 3, TP.HCM','COMPLETED',50000.00,50000.00,3),(4,'2026-03-15 06:36:48.000000',0.00,'Phạm Gia Bảo','Thêm ớt','COD','0901000004','88 Cộng Hòa, Tân Bình, TP.HCM','COMPLETED',45000.00,45000.00,4),(5,'2026-03-16 06:36:48.000000',0.00,'Đặng Tuấn Kiệt',NULL,'COD','0901000005','41 Phan Xích Long, Phú Nhuận, TP.HCM','COMPLETED',65000.00,65000.00,5),(6,'2026-03-18 06:36:48.000000',0.00,'Võ Quốc Huy','Không rau','COD','0901000006','73 Nguyễn Thị Minh Khai, Quận 3, TP.HCM','COMPLETED',60000.00,60000.00,6),(7,'2026-03-19 06:36:48.000000',0.00,'Bùi Khánh Linh',NULL,'COD','0901000007','51 Điện Biên Phủ, Bình Thạnh, TP.HCM','COMPLETED',70000.00,70000.00,7),(8,'2026-03-20 06:36:48.000000',0.00,'Ngô Thảo Vy','Thêm tương','COD','0901000008','9 Võ Văn Tần, Quận 3, TP.HCM','COMPLETED',55000.00,55000.00,8),(9,'2026-03-22 06:36:48.000000',0.00,'Mai Quốc Cường',NULL,'COD','0901000009','66 Hoàng Văn Thụ, Phú Nhuận, TP.HCM','COMPLETED',45000.00,45000.00,9),(10,'2026-03-23 06:36:48.000000',0.00,'Huỳnh Ngọc Hà','Giao nhanh giúp','COD','0901000010','102 Lý Thường Kiệt, Quận 10, TP.HCM','COMPLETED',50000.00,50000.00,10),(11,'2026-03-25 06:36:48.000000',0.00,'Phan Đức Tài',NULL,'COD','0901000011','15 Nguyễn Oanh, Gò Vấp, TP.HCM','COMPLETED',120000.00,120000.00,11),(12,'2026-03-26 06:36:48.000000',0.00,'Đỗ Thanh Tùng','Thêm khăn giấy','COD','0901000012','7 Âu Cơ, Tân Bình, TP.HCM','COMPLETED',85000.00,85000.00,12),(13,'2026-03-28 06:36:48.000000',0.00,'Lý Quỳnh Anh',NULL,'COD','0901000013','93 Trường Chinh, Tân Bình, TP.HCM','COMPLETED',65000.00,65000.00,13),(14,'2026-03-29 06:36:48.000000',0.00,'Tạ Hoàng Long','Ít đá','COD','0901000014','48 Nguyễn Văn Đậu, Bình Thạnh, TP.HCM','COMPLETED',30000.00,30000.00,14),(15,'2026-03-30 06:36:48.000000',0.00,'Cao Gia Hân',NULL,'COD','0901000015','22 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM','COMPLETED',35000.00,35000.00,15),(16,'2026-04-09 06:41:48.050650',0.00,'admin','','STRIPE','0901234567','123 Main St, District 1, HCM','COMPLETED',95000.00,95000.00,1),(17,'2026-04-09 08:02:56.055040',0.00,'admin','','COD','0901234567','123 Main St, District 1, HCM','COMPLETED',170000.00,170000.00,1),(18,'2026-04-09 10:18:34.333993',0.00,'tao 2','','COD','0971760561','số 2, Hà Nội, Hà Nội','PENDING',115000.00,115000.00,5),(19,'2026-04-09 10:19:42.240928',0.00,'tao 2','','STRIPE','0971760561','số 2, Hà Nội, Hà Nội','CONFIRMED',95000.00,95000.00,5),(20,'2026-04-09 10:23:36.427802',0.00,'tao 2','','STRIPE','0971760561','số 2, Hà Nội, Hà Nội','CONFIRMED',170000.00,170000.00,5),(21,'2026-04-09 10:28:30.074109',0.00,'admin','','STRIPE','0901234567','123 Main St, District 1, HCM','CONFIRMED',8475000.00,8475000.00,1),(22,'2026-04-09 10:42:45.731865',0.00,'admin','','STRIPE','0901234567','123 Main St, District 1, HCM','CONFIRMED',130000.00,130000.00,1),(23,'2026-04-09 10:55:10.437968',0.00,'tao 2','','STRIPE','0971760561','số 2, Hà Nội, Hà Nội','PENDING',215000.00,215000.00,5),(24,'2026-04-12 10:22:53.475689',0.00,'admin','','COD','0901234567','123 Main St, District 1, HCM','PENDING',355000.00,355000.00,1);


-- Data: order_details
INSERT INTO order_details VALUES (1,55000.00,1,1,1),(2,25000.00,1,1,17),(3,60000.00,1,2,2),(4,25000.00,1,2,19),(5,50000.00,1,3,3),(6,30000.00,1,3,18),(7,45000.00,1,4,4),(8,20000.00,1,4,20),(9,65000.00,1,5,5),(10,45000.00,1,5,16),(11,60000.00,1,6,6),(12,25000.00,1,6,17),(13,70000.00,1,7,7),(14,30000.00,1,7,18),(15,55000.00,1,8,8),(16,25000.00,1,8,19),(17,45000.00,1,9,9),(18,20000.00,1,9,20),(19,50000.00,1,10,10),(20,25000.00,1,10,17),(21,120000.00,1,11,11),(22,45000.00,1,11,16),(23,85000.00,1,12,12),(24,30000.00,1,12,18),(25,65000.00,1,13,13),(26,25000.00,1,13,19),(27,30000.00,1,14,14),(28,45000.00,1,14,16),(29,35000.00,1,15,15),(30,20000.00,1,15,20),(31,50000.00,1,16,10),(32,45000.00,1,16,9),(33,50000.00,1,17,10),(34,120000.00,1,17,11),(35,55000.00,1,18,1),(36,60000.00,1,18,2),(37,50000.00,1,19,3),(38,45000.00,1,19,4),(39,50000.00,1,20,10),(40,120000.00,1,20,11),(41,85000.00,99,21,12),(42,60000.00,1,21,2),(43,70000.00,1,22,7),(44,60000.00,1,22,6),(45,60000.00,1,23,2),(46,50000.00,1,23,3),(47,45000.00,1,23,4),(48,60000.00,1,23,6),(49,60000.00,1,24,2),(50,50000.00,3,24,3),(51,45000.00,2,24,4),(52,55000.00,1,24,1);


-- Data: payments
INSERT INTO payments VALUES (1,95000.00,'{\n  \"id\": \"evt_1TK5jvJ316RdiQ8tRoQn9XIi\",\n  \"object\": \"event\",\n  \"api_version\": \"2026-03-25.dahlia\",\n  \"created\": 1775691751,\n  \"data\": {\n    \"object\": {\n      \"id\": \"cs_test_a1FiGBhTgBdZAjEZqZpezSXTDMj2GUSKmdOKEgBdECI4BUmzzt3OQgdyCa\",\n      \"object\": \"checkout.session\",\n      \"adaptive_pricing\": {\n        \"enabled\": true\n      },\n      \"after_expiration\": null,\n      \"allow_promotion_codes\": null,\n      \"amount_subtotal\": 95000,\n      \"amount_total\": 95000,\n      \"automatic_tax\": {\n        \"enabled\": false,\n        \"liability\": null,\n        \"provider\": null,\n        \"status\": null\n      },\n      \"billing_address_collection\": null,\n      \"branding_settings\": {\n        \"background_color\": \"#ffffff\",\n        \"border_style\": \"rounded\",\n        \"button_color\": \"#0074d4\",\n        \"display_name\": \"? sandbox\",\n        \"font_family\": \"default\",\n        \"icon\": null,\n        \"logo\": null\n      },\n      \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n      \"client_reference_id\": \"16\",\n      \"client_secret\": null,\n      \"collected_information\": null,\n      \"consent\": null,\n      \"consent_collection\": null,\n      \"created\": 1775691731,\n      \"currency\": \"vnd\",\n      \"currency_conversion\": null,\n      \"custom_fields\": [],\n      \"custom_text\": {\n        \"after_submit\": null,\n        \"shipping_address\": null,\n        \"submit\": null,\n        \"terms_of_service_acceptance\": null\n      },\n      \"customer\": null,\n      \"customer_account\": null,\n      \"customer_creation\": \"if_required\",\n      \"customer_details\": {\n        \"address\": {\n          \"city\": null,\n          \"country\": \"VN\",\n          \"line1\": null,\n          \"line2\": null,\n          \"postal_code\": null,\n          \"state\": null\n        },\n        \"business_name\": null,\n        \"email\": \"phamquangdung188@gmail.com\",\n        \"individual_name\": null,\n        \"name\": \"Pham Quang Dung\",\n        \"phone\": null,\n        \"tax_exempt\": \"none\",\n        \"tax_ids\": []\n      },\n      \"customer_email\": null,\n      \"discounts\": [],\n      \"expires_at\": 1775778131,\n      \"integration_identifier\": null,\n      \"invoice\": null,\n      \"invoice_creation\": {\n        \"enabled\": false,\n        \"invoice_data\": {\n          \"account_tax_ids\": null,\n          \"custom_fields\": null,\n          \"description\": null,\n          \"footer\": null,\n          \"issuer\": null,\n          \"metadata\": {},\n          \"rendering_options\": null\n        }\n      },\n      \"livemode\": false,\n      \"locale\": null,\n      \"metadata\": {\n        \"paymentMethod\": \"STRIPE\",\n        \"orderId\": \"16\"\n      },\n      \"mode\": \"payment\",\n      \"origin_context\": null,\n      \"payment_intent\": \"pi_3TK5juJ316RdiQ8t12MmaQRG\",\n      \"payment_link\": null,\n      \"payment_method_collection\": \"if_required\",\n      \"payment_method_configuration_details\": {\n        \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n        \"parent\": null\n      },\n      \"payment_method_options\": {\n        \"card\": {\n          \"request_three_d_secure\": \"automatic\"\n        }\n      },\n      \"payment_method_types\": [\n        \"card\",\n        \"link\"\n      ],\n      \"payment_status\": \"paid\",\n      \"permissions\": null,\n      \"phone_number_collection\": {\n        \"enabled\": false\n      },\n      \"recovered_from\": null,\n      \"saved_payment_method_options\": null,\n      \"setup_intent\": null,\n      \"shipping_address_collection\": null,\n      \"shipping_cost\": null,\n      \"shipping_options\": [],\n      \"status\": \"complete\",\n      \"submit_type\": null,\n      \"subscription\": null,\n      \"success_url\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n      \"total_details\": {\n        \"amount_discount\": 0,\n        \"amount_shipping\": 0,\n        \"amount_tax\": 0\n      },\n      \"ui_mode\": \"hosted_page\",\n      \"url\": null,\n      \"wallet_options\": null\n    }\n  },\n  \"livemode\": false,\n  \"pending_webhooks\": 2,\n  \"request\": {\n    \"id\": null,\n    \"idempotency_key\": null\n  },\n  \"type\": \"checkout.session.completed\"\n}',NULL,'2026-04-09 06:41:48.894929','STRIPE','COMPLETED','cs_test_a1FiGBhTgBdZAjEZqZpezSXTDMj2GUSKmdOKEgBdECI4BUmzzt3OQgdyCa',16),(2,95000.00,'{\n  \"id\": \"evt_1TK98qJ316RdiQ8tAak00FXL\",\n  \"object\": \"event\",\n  \"api_version\": \"2026-03-25.dahlia\",\n  \"created\": 1775704828,\n  \"data\": {\n    \"object\": {\n      \"id\": \"cs_test_a1BsW40Yt6LCBwrAjwPkPhWVEriCX0tjF1wsl1HVIfB9FpOmdOKNaDaCc2\",\n      \"object\": \"checkout.session\",\n      \"adaptive_pricing\": {\n        \"enabled\": true\n      },\n      \"after_expiration\": null,\n      \"allow_promotion_codes\": null,\n      \"amount_subtotal\": 95000,\n      \"amount_total\": 95000,\n      \"automatic_tax\": {\n        \"enabled\": false,\n        \"liability\": null,\n        \"provider\": null,\n        \"status\": null\n      },\n      \"billing_address_collection\": null,\n      \"branding_settings\": {\n        \"background_color\": \"#ffffff\",\n        \"border_style\": \"rounded\",\n        \"button_color\": \"#0074d4\",\n        \"display_name\": \"? sandbox\",\n        \"font_family\": \"default\",\n        \"icon\": null,\n        \"logo\": null\n      },\n      \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n      \"client_reference_id\": \"19\",\n      \"client_secret\": null,\n      \"collected_information\": null,\n      \"consent\": null,\n      \"consent_collection\": null,\n      \"created\": 1775704808,\n      \"currency\": \"vnd\",\n      \"currency_conversion\": null,\n      \"custom_fields\": [],\n      \"custom_text\": {\n        \"after_submit\": null,\n        \"shipping_address\": null,\n        \"submit\": null,\n        \"terms_of_service_acceptance\": null\n      },\n      \"customer\": null,\n      \"customer_account\": null,\n      \"customer_creation\": \"if_required\",\n      \"customer_details\": {\n        \"address\": {\n          \"city\": null,\n          \"country\": \"VN\",\n          \"line1\": null,\n          \"line2\": null,\n          \"postal_code\": null,\n          \"state\": null\n        },\n        \"business_name\": null,\n        \"email\": \"phamquangdung188@gmail.com\",\n        \"individual_name\": null,\n        \"name\": \"Pham Quang Dung\",\n        \"phone\": null,\n        \"tax_exempt\": \"none\",\n        \"tax_ids\": []\n      },\n      \"customer_email\": null,\n      \"discounts\": [],\n      \"expires_at\": 1775791208,\n      \"integration_identifier\": null,\n      \"invoice\": null,\n      \"invoice_creation\": {\n        \"enabled\": false,\n        \"invoice_data\": {\n          \"account_tax_ids\": null,\n          \"custom_fields\": null,\n          \"description\": null,\n          \"footer\": null,\n          \"issuer\": null,\n          \"metadata\": {},\n          \"rendering_options\": null\n        }\n      },\n      \"livemode\": false,\n      \"locale\": null,\n      \"metadata\": {\n        \"paymentMethod\": \"STRIPE\",\n        \"orderId\": \"19\"\n      },\n      \"mode\": \"payment\",\n      \"origin_context\": null,\n      \"payment_intent\": \"pi_3TK98pJ316RdiQ8t0IT44B5B\",\n      \"payment_link\": null,\n      \"payment_method_collection\": \"if_required\",\n      \"payment_method_configuration_details\": {\n        \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n        \"parent\": null\n      },\n      \"payment_method_options\": {\n        \"card\": {\n          \"request_three_d_secure\": \"automatic\"\n        }\n      },\n      \"payment_method_types\": [\n        \"card\",\n        \"link\"\n      ],\n      \"payment_status\": \"paid\",\n      \"permissions\": null,\n      \"phone_number_collection\": {\n        \"enabled\": false\n      },\n      \"recovered_from\": null,\n      \"saved_payment_method_options\": null,\n      \"setup_intent\": null,\n      \"shipping_address_collection\": null,\n      \"shipping_cost\": null,\n      \"shipping_options\": [],\n      \"status\": \"complete\",\n      \"submit_type\": null,\n      \"subscription\": null,\n      \"success_url\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n      \"total_details\": {\n        \"amount_discount\": 0,\n        \"amount_shipping\": 0,\n        \"amount_tax\": 0\n      },\n      \"ui_mode\": \"hosted_page\",\n      \"url\": null,\n      \"wallet_options\": null\n    }\n  },\n  \"livemode\": false,\n  \"pending_webhooks\": 2,\n  \"request\": {\n    \"id\": null,\n    \"idempotency_key\": null\n  },\n  \"type\": \"checkout.session.completed\"\n}',NULL,'2026-04-09 10:19:45.636508','STRIPE','COMPLETED','cs_test_a1BsW40Yt6LCBwrAjwPkPhWVEriCX0tjF1wsl1HVIfB9FpOmdOKNaDaCc2',19),(3,170000.00,'{\n  \"id\": \"evt_1TK9CVJ316RdiQ8tJOLUtyxC\",\n  \"object\": \"event\",\n  \"api_version\": \"2026-03-25.dahlia\",\n  \"created\": 1775705055,\n  \"data\": {\n    \"object\": {\n      \"id\": \"cs_test_a1Q6dPEcnh6kC9QBozvTNLUZN9gT19rod01ZRJ1XNGppRVMhrgpEeD2aY8\",\n      \"object\": \"checkout.session\",\n      \"adaptive_pricing\": {\n        \"enabled\": true\n      },\n      \"after_expiration\": null,\n      \"allow_promotion_codes\": null,\n      \"amount_subtotal\": 170000,\n      \"amount_total\": 170000,\n      \"automatic_tax\": {\n        \"enabled\": false,\n        \"liability\": null,\n        \"provider\": null,\n        \"status\": null\n      },\n      \"billing_address_collection\": null,\n      \"branding_settings\": {\n        \"background_color\": \"#ffffff\",\n        \"border_style\": \"rounded\",\n        \"button_color\": \"#0074d4\",\n        \"display_name\": \"? sandbox\",\n        \"font_family\": \"default\",\n        \"icon\": null,\n        \"logo\": null\n      },\n      \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n      \"client_reference_id\": \"20\",\n      \"client_secret\": null,\n      \"collected_information\": null,\n      \"consent\": null,\n      \"consent_collection\": null,\n      \"created\": 1775705040,\n      \"currency\": \"vnd\",\n      \"currency_conversion\": null,\n      \"custom_fields\": [],\n      \"custom_text\": {\n        \"after_submit\": null,\n        \"shipping_address\": null,\n        \"submit\": null,\n        \"terms_of_service_acceptance\": null\n      },\n      \"customer\": null,\n      \"customer_account\": null,\n      \"customer_creation\": \"if_required\",\n      \"customer_details\": {\n        \"address\": {\n          \"city\": null,\n          \"country\": \"VN\",\n          \"line1\": null,\n          \"line2\": null,\n          \"postal_code\": null,\n          \"state\": null\n        },\n        \"business_name\": null,\n        \"email\": \"phamquangdung188@gmail.com\",\n        \"individual_name\": null,\n        \"name\": \"Pham Quang Dung\",\n        \"phone\": null,\n        \"tax_exempt\": \"none\",\n        \"tax_ids\": []\n      },\n      \"customer_email\": null,\n      \"discounts\": [],\n      \"expires_at\": 1775791440,\n      \"integration_identifier\": null,\n      \"invoice\": null,\n      \"invoice_creation\": {\n        \"enabled\": false,\n        \"invoice_data\": {\n          \"account_tax_ids\": null,\n          \"custom_fields\": null,\n          \"description\": null,\n          \"footer\": null,\n          \"issuer\": null,\n          \"metadata\": {},\n          \"rendering_options\": null\n        }\n      },\n      \"livemode\": false,\n      \"locale\": null,\n      \"metadata\": {\n        \"paymentMethod\": \"STRIPE\",\n        \"orderId\": \"20\"\n      },\n      \"mode\": \"payment\",\n      \"origin_context\": null,\n      \"payment_intent\": \"pi_3TK9CTJ316RdiQ8t1HoUGoww\",\n      \"payment_link\": null,\n      \"payment_method_collection\": \"if_required\",\n      \"payment_method_configuration_details\": {\n        \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n        \"parent\": null\n      },\n      \"payment_method_options\": {\n        \"card\": {\n          \"request_three_d_secure\": \"automatic\"\n        }\n      },\n      \"payment_method_types\": [\n        \"card\",\n        \"link\"\n      ],\n      \"payment_status\": \"paid\",\n      \"permissions\": null,\n      \"phone_number_collection\": {\n        \"enabled\": false\n      },\n      \"recovered_from\": null,\n      \"saved_payment_method_options\": null,\n      \"setup_intent\": null,\n      \"shipping_address_collection\": null,\n      \"shipping_cost\": null,\n      \"shipping_options\": [],\n      \"status\": \"complete\",\n      \"submit_type\": null,\n      \"subscription\": null,\n      \"success_url\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n      \"total_details\": {\n        \"amount_discount\": 0,\n        \"amount_shipping\": 0,\n        \"amount_tax\": 0\n      },\n      \"ui_mode\": \"hosted_page\",\n      \"url\": null,\n      \"wallet_options\": null\n    }\n  },\n  \"livemode\": false,\n  \"pending_webhooks\": 2,\n  \"request\": {\n    \"id\": null,\n    \"idempotency_key\": null\n  },\n  \"type\": \"checkout.session.completed\"\n}',NULL,'2026-04-09 10:23:37.270471','STRIPE','COMPLETED','cs_test_a1Q6dPEcnh6kC9QBozvTNLUZN9gT19rod01ZRJ1XNGppRVMhrgpEeD2aY8',20),(4,8475000.00,'{\n  \"id\": \"evt_1TK9HIJ316RdiQ8tZjEirsq9\",\n  \"object\": \"event\",\n  \"api_version\": \"2026-03-25.dahlia\",\n  \"created\": 1775705352,\n  \"data\": {\n    \"object\": {\n      \"id\": \"cs_test_a1rdPZisx2mtx2SD3WrDtGSHqCq2tzropt614XfpQgHGQytfawC3oxDI3C\",\n      \"object\": \"checkout.session\",\n      \"adaptive_pricing\": {\n        \"enabled\": true\n      },\n      \"after_expiration\": null,\n      \"allow_promotion_codes\": null,\n      \"amount_subtotal\": 8475000,\n      \"amount_total\": 8475000,\n      \"automatic_tax\": {\n        \"enabled\": false,\n        \"liability\": null,\n        \"provider\": null,\n        \"status\": null\n      },\n      \"billing_address_collection\": null,\n      \"branding_settings\": {\n        \"background_color\": \"#ffffff\",\n        \"border_style\": \"rounded\",\n        \"button_color\": \"#0074d4\",\n        \"display_name\": \"? sandbox\",\n        \"font_family\": \"default\",\n        \"icon\": null,\n        \"logo\": null\n      },\n      \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n      \"client_reference_id\": \"21\",\n      \"client_secret\": null,\n      \"collected_information\": null,\n      \"consent\": null,\n      \"consent_collection\": null,\n      \"created\": 1775705334,\n      \"currency\": \"vnd\",\n      \"currency_conversion\": null,\n      \"custom_fields\": [],\n      \"custom_text\": {\n        \"after_submit\": null,\n        \"shipping_address\": null,\n        \"submit\": null,\n        \"terms_of_service_acceptance\": null\n      },\n      \"customer\": null,\n      \"customer_account\": null,\n      \"customer_creation\": \"if_required\",\n      \"customer_details\": {\n        \"address\": {\n          \"city\": null,\n          \"country\": \"VN\",\n          \"line1\": null,\n          \"line2\": null,\n          \"postal_code\": null,\n          \"state\": null\n        },\n        \"business_name\": null,\n        \"email\": \"phamquangdung188@gmail.com\",\n        \"individual_name\": null,\n        \"name\": \"Pham Quang Dung\",\n        \"phone\": null,\n        \"tax_exempt\": \"none\",\n        \"tax_ids\": []\n      },\n      \"customer_email\": null,\n      \"discounts\": [],\n      \"expires_at\": 1775791734,\n      \"integration_identifier\": null,\n      \"invoice\": null,\n      \"invoice_creation\": {\n        \"enabled\": false,\n        \"invoice_data\": {\n          \"account_tax_ids\": null,\n          \"custom_fields\": null,\n          \"description\": null,\n          \"footer\": null,\n          \"issuer\": null,\n          \"metadata\": {},\n          \"rendering_options\": null\n        }\n      },\n      \"livemode\": false,\n      \"locale\": null,\n      \"metadata\": {\n        \"paymentMethod\": \"STRIPE\",\n        \"orderId\": \"21\"\n      },\n      \"mode\": \"payment\",\n      \"origin_context\": null,\n      \"payment_intent\": \"pi_3TK9HHJ316RdiQ8t1D0KVCUq\",\n      \"payment_link\": null,\n      \"payment_method_collection\": \"if_required\",\n      \"payment_method_configuration_details\": {\n        \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n        \"parent\": null\n      },\n      \"payment_method_options\": {\n        \"card\": {\n          \"request_three_d_secure\": \"automatic\"\n        }\n      },\n      \"payment_method_types\": [\n        \"card\",\n        \"link\"\n      ],\n      \"payment_status\": \"paid\",\n      \"permissions\": null,\n      \"phone_number_collection\": {\n        \"enabled\": false\n      },\n      \"recovered_from\": null,\n      \"saved_payment_method_options\": null,\n      \"setup_intent\": null,\n      \"shipping_address_collection\": null,\n      \"shipping_cost\": null,\n      \"shipping_options\": [],\n      \"status\": \"complete\",\n      \"submit_type\": null,\n      \"subscription\": null,\n      \"success_url\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n      \"total_details\": {\n        \"amount_discount\": 0,\n        \"amount_shipping\": 0,\n        \"amount_tax\": 0\n      },\n      \"ui_mode\": \"hosted_page\",\n      \"url\": null,\n      \"wallet_options\": null\n    }\n  },\n  \"livemode\": false,\n  \"pending_webhooks\": 2,\n  \"request\": {\n    \"id\": null,\n    \"idempotency_key\": null\n  },\n  \"type\": \"checkout.session.completed\"\n}',NULL,'2026-04-09 10:28:31.203948','STRIPE','COMPLETED','cs_test_a1rdPZisx2mtx2SD3WrDtGSHqCq2tzropt614XfpQgHGQytfawC3oxDI3C',21),(5,130000.00,'{\n  \"id\": \"evt_1TK9V6J316RdiQ8tNkGlkya7\",\n  \"object\": \"event\",\n  \"api_version\": \"2026-03-25.dahlia\",\n  \"created\": 1775706207,\n  \"data\": {\n    \"object\": {\n      \"id\": \"cs_test_a1ITE5a4SPrn0EXGd2DeztTsTqgubV9cdtxJdV6uyqKgOCp936bVJwCpxL\",\n      \"object\": \"checkout.session\",\n      \"adaptive_pricing\": {\n        \"enabled\": true\n      },\n      \"after_expiration\": null,\n      \"allow_promotion_codes\": null,\n      \"amount_subtotal\": 130000,\n      \"amount_total\": 130000,\n      \"automatic_tax\": {\n        \"enabled\": false,\n        \"liability\": null,\n        \"provider\": null,\n        \"status\": null\n      },\n      \"billing_address_collection\": null,\n      \"branding_settings\": {\n        \"background_color\": \"#ffffff\",\n        \"border_style\": \"rounded\",\n        \"button_color\": \"#0074d4\",\n        \"display_name\": \"? sandbox\",\n        \"font_family\": \"default\",\n        \"icon\": null,\n        \"logo\": null\n      },\n      \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n      \"client_reference_id\": \"22\",\n      \"client_secret\": null,\n      \"collected_information\": null,\n      \"consent\": null,\n      \"consent_collection\": null,\n      \"created\": 1775706190,\n      \"currency\": \"vnd\",\n      \"currency_conversion\": null,\n      \"custom_fields\": [],\n      \"custom_text\": {\n        \"after_submit\": null,\n        \"shipping_address\": null,\n        \"submit\": null,\n        \"terms_of_service_acceptance\": null\n      },\n      \"customer\": null,\n      \"customer_account\": null,\n      \"customer_creation\": \"if_required\",\n      \"customer_details\": {\n        \"address\": {\n          \"city\": null,\n          \"country\": \"VN\",\n          \"line1\": null,\n          \"line2\": null,\n          \"postal_code\": null,\n          \"state\": null\n        },\n        \"business_name\": null,\n        \"email\": \"phamquangdung188@gmail.com\",\n        \"individual_name\": null,\n        \"name\": \"Pham Quang Dung\",\n        \"phone\": null,\n        \"tax_exempt\": \"none\",\n        \"tax_ids\": []\n      },\n      \"customer_email\": null,\n      \"discounts\": [],\n      \"expires_at\": 1775792590,\n      \"integration_identifier\": null,\n      \"invoice\": null,\n      \"invoice_creation\": {\n        \"enabled\": false,\n        \"invoice_data\": {\n          \"account_tax_ids\": null,\n          \"custom_fields\": null,\n          \"description\": null,\n          \"footer\": null,\n          \"issuer\": null,\n          \"metadata\": {},\n          \"rendering_options\": null\n        }\n      },\n      \"livemode\": false,\n      \"locale\": null,\n      \"metadata\": {\n        \"paymentMethod\": \"STRIPE\",\n        \"orderId\": \"22\"\n      },\n      \"mode\": \"payment\",\n      \"origin_context\": null,\n      \"payment_intent\": \"pi_3TK9V4J316RdiQ8t0hsJABDd\",\n      \"payment_link\": null,\n      \"payment_method_collection\": \"if_required\",\n      \"payment_method_configuration_details\": {\n        \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n        \"parent\": null\n      },\n      \"payment_method_options\": {\n        \"card\": {\n          \"request_three_d_secure\": \"automatic\"\n        }\n      },\n      \"payment_method_types\": [\n        \"card\",\n        \"link\"\n      ],\n      \"payment_status\": \"paid\",\n      \"permissions\": null,\n      \"phone_number_collection\": {\n        \"enabled\": false\n      },\n      \"recovered_from\": null,\n      \"saved_payment_method_options\": null,\n      \"setup_intent\": null,\n      \"shipping_address_collection\": null,\n      \"shipping_cost\": null,\n      \"shipping_options\": [],\n      \"status\": \"complete\",\n      \"submit_type\": null,\n      \"subscription\": null,\n      \"success_url\": \"http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}\",\n      \"total_details\": {\n        \"amount_discount\": 0,\n        \"amount_shipping\": 0,\n        \"amount_tax\": 0\n      },\n      \"ui_mode\": \"hosted_page\",\n      \"url\": null,\n      \"wallet_options\": null\n    }\n  },\n  \"livemode\": false,\n  \"pending_webhooks\": 2,\n  \"request\": {\n    \"id\": null,\n    \"idempotency_key\": null\n  },\n  \"type\": \"checkout.session.completed\"\n}',NULL,'2026-04-09 10:42:46.846891','STRIPE','COMPLETED','cs_test_a1ITE5a4SPrn0EXGd2DeztTsTqgubV9cdtxJdV6uyqKgOCp936bVJwCpxL',22),(6,215000.00,'{\n  \"adaptive_pricing\": {\n    \"enabled\": true\n  },\n  \"after_expiration\": null,\n  \"allow_promotion_codes\": null,\n  \"amount_subtotal\": 215000,\n  \"amount_total\": 215000,\n  \"automatic_tax\": {\n    \"enabled\": false,\n    \"liability\": null,\n    \"status\": null\n  },\n  \"billing_address_collection\": null,\n  \"cancel_url\": \"http://localhost:3000/payment/cancel\",\n  \"client_reference_id\": \"23\",\n  \"client_secret\": null,\n  \"consent\": null,\n  \"consent_collection\": null,\n  \"created\": 1775706934,\n  \"currency\": \"vnd\",\n  \"currency_conversion\": null,\n  \"custom_fields\": [],\n  \"custom_text\": {\n    \"after_submit\": null,\n    \"shipping_address\": null,\n    \"submit\": null,\n    \"terms_of_service_acceptance\": null\n  },\n  \"customer\": null,\n  \"customer_creation\": \"if_required\",\n  \"customer_details\": null,\n  \"customer_email\": null,\n  \"expires_at\": 1775793334,\n  \"id\": \"cs_test_a1dJR5sPypMbpHJQt9VnzpAkLUzuzTZMLWrEAMwqg3Oa4oygD8lyEc8S5i\",\n  \"invoice\": null,\n  \"invoice_creation\": {\n    \"enabled\": false,\n    \"invoice_data\": {\n      \"account_tax_ids\": null,\n      \"custom_fields\": null,\n      \"description\": null,\n      \"footer\": null,\n      \"issuer\": null,\n      \"metadata\": {},\n      \"rendering_options\": null\n    }\n  },\n  \"line_items\": null,\n  \"livemode\": false,\n  \"locale\": null,\n  \"metadata\": {\n    \"orderId\": \"23\",\n    \"paymentMethod\": \"STRIPE\"\n  },\n  \"mode\": \"payment\",\n  \"object\": \"checkout.session\",\n  \"payment_intent\": null,\n  \"payment_link\": null,\n  \"payment_method_collection\": \"if_required\",\n  \"payment_method_configuration_details\": {\n    \"id\": \"pmc_1TJmWBJ316RdiQ8txW7aHBsP\",\n    \"parent\": null\n  },\n  \"payment_method_options\": {\n    \"acss_debit\": null,\n    \"affirm\": null,\n    \"afterpay_clearpay\": null,\n    \"alipay\": null,\n    \"amazon_pay\": null,\n    \"au_becs_debit\": null,\n    \"bacs_debit\": null,\n    \"bancontact\": null,\n    \"boleto\": null,\n    \"card\": {\n      \"installments\": null,\n      \"request_extended_authorization\": null,\n      \"request_incremental_authorization\": null,\n      \"request_multicapture\": null,\n      \"request_overcapture\": null,\n      \"request_three_d_secure\": \"automatic\",\n      \"setup_future_usage\": null,\n      \"statement_descriptor_suffix_kana\": null,\n      \"statement_descriptor_suffix_kanji\": null\n    },\n    \"cashapp\": null,\n    \"customer_balance\": null,\n    \"eps\": null,\n    \"fpx\": null,\n    \"giropay\": null,\n    \"grabpay\": null,\n    \"ideal\": null,\n    \"kakao_pay\": null,\n    \"klarna\": null,\n    \"konbini\": null,\n    \"kr_card\": null,\n    \"link\": null,\n    \"mobilepay\": null,\n    \"multibanco\": null,\n    \"naver_pay\": null,\n    \"oxxo\": null,\n    \"p24\": null,\n    \"payco\": null,\n    \"paynow\": null,\n    \"paypal\": null,\n    \"pix\": null,\n    \"revolut_pay\": null,\n    \"samsung_pay\": null,\n    \"sepa_debit\": null,\n    \"sofort\": null,\n    \"swish\": null,\n    \"us_bank_account\": null\n  },\n  \"payment_method_types\": [\n    \"card\",\n    \"link\"\n  ],\n  \"payment_status\": \"unpaid\",\n  \"phone_number_collection\": {\n    \"enabled\": false\n  },\n  \"recovered_from\": null,\n  \"redirect_on_completion\": null,\n  \"return_url\": null,\n  \"saved_payment_method_options\": null,\n  \"setup_intent\": null,\n  \"shipping_address_collection\": null,\n  \"shipping_cost\": null,\n  \"shipping_details\": null,\n  \"shipping_options\": [],\n  \"status\": \"open\",\n  \"submit_type\": null,\n  \"subscription\": null,\n  \"success_url\": \"http://localhost:3000/payment/success?session_id\\u003d{CHECKOUT_SESSION_ID}\",\n  \"tax_id_collection\": null,\n  \"total_details\": {\n    \"amount_discount\": 0,\n    \"amount_shipping\": 0,\n    \"amount_tax\": 0,\n    \"breakdown\": null\n  },\n  \"ui_mode\": \"hosted\",\n  \"url\": \"https://checkout.stripe.com/c/pay/cs_test_a1dJR5sPypMbpHJQt9VnzpAkLUzuzTZMLWrEAMwqg3Oa4oygD8lyEc8S5i#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0UU9oU2ZPNjQzV2FsVD1xRn9oX11vaEpRN1JPQE9UT0NBVWdKUVRpZnREQHBxf2BQQEpnVWFgMWhhZFF9MjdLTlNtQHBpMHdEbDZ1MmRzVkFjMDBRcXRhNTU0cUJzYE9mMicpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl\"\n}',NULL,'2026-04-09 10:55:11.315597','STRIPE','PENDING','cs_test_a1dJR5sPypMbpHJQt9VnzpAkLUzuzTZMLWrEAMwqg3Oa4oygD8lyEc8S5i',23);


-- Data: product_likes
INSERT INTO product_likes VALUES (5,'2026-04-09 07:52:36.169253',3,1),(6,'2026-04-09 07:52:55.364433',4,1);


-- Data: product_stats (rating_distribution must be clean JSON without backslash escapes for PostgreSQL)
INSERT INTO product_stats VALUES (1,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 2}',2,'2026-04-09 06:36:48.000000'),(2,4.50,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 1}',2,'2026-04-09 06:36:48.000000'),(3,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(4,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(5,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000'),(6,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 2}',2,'2026-04-09 06:36:48.000000'),(7,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(8,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000'),(9,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(10,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000'),(11,4.67,'{"1":0,"2":0,"3":0,"4":1,"5":2}',3,'2026-04-09 08:25:57.881754'),(12,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(13,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000'),(14,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 2}',2,'2026-04-09 06:36:48.000000'),(15,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(16,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 2}',2,'2026-04-09 06:36:48.000000'),(17,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(18,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000'),(19,4.00,'{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}',1,'2026-04-09 06:36:48.000000'),(20,5.00,'{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}',1,'2026-04-09 06:36:48.000000');


-- Data: reviews
INSERT INTO reviews VALUES (1,NULL,'2026-03-11 06:36:48.000000',5,1,1,'Nước dùng rất thơm, bò mềm và bánh phở ngon. Sẽ đặt lại.',NULL,0,NULL,NULL,'APPROVED','2026-03-11 06:36:48.000000',1),(2,NULL,'2026-03-13 06:36:48.000000',5,2,2,'Đậm vị, thơm mùi sả, phần topping đầy đặn.',NULL,0,NULL,NULL,'APPROVED','2026-03-13 06:36:48.000000',3),(3,NULL,'2026-03-14 06:36:48.000000',4,3,3,'Hủ tiếu thanh vị, tôm mực tươi, ăn khá vừa miệng.',NULL,0,NULL,NULL,'APPROVED','2026-03-14 06:36:48.000000',5),(4,NULL,'2026-03-16 06:36:48.000000',4,4,4,'Bún riêu ngon, nước dùng chua nhẹ dễ ăn.',NULL,0,NULL,NULL,'APPROVED','2026-03-16 06:36:48.000000',7),(5,NULL,'2026-03-17 06:36:48.000000',5,5,5,'Mì quảng ếch đậm đà, thịt ếch săn chắc và không bị tanh.',NULL,0,NULL,NULL,'APPROVED','2026-03-17 06:36:48.000000',9),(6,NULL,'2026-03-19 06:36:48.000000',5,6,6,'Cơm tấm chuẩn vị, sườn nướng thơm và mềm.',NULL,0,NULL,NULL,'APPROVED','2026-03-19 06:36:48.000000',11),(7,NULL,'2026-03-20 06:36:48.000000',4,7,7,'Cơm chiên hải sản tơi hạt, nêm nếm vừa.',NULL,0,NULL,NULL,'APPROVED','2026-03-20 06:36:48.000000',13),(8,NULL,'2026-03-21 06:36:48.000000',5,8,8,'Gà giòn da mà thịt vẫn mềm, cơm rang nghệ cũng ổn.',NULL,0,NULL,NULL,'APPROVED','2026-03-21 06:36:48.000000',15),(9,NULL,'2026-03-23 06:36:48.000000',4,9,9,'Thịt kho mềm, vị hơi ngọt nhẹ nhưng ăn với cơm rất hợp.',NULL,0,NULL,NULL,'APPROVED','2026-03-23 06:36:48.000000',17),(10,NULL,'2026-03-24 06:36:48.000000',5,10,10,'Cá kho rất bắt cơm, nước kho sệt và thơm tiêu.',NULL,0,NULL,NULL,'APPROVED','2026-03-24 06:36:48.000000',19),(11,NULL,'2026-03-26 06:36:48.000000',5,11,11,'Pizza nhiều phô mai, hải sản khá tươi, ăn nóng rất ngon.',NULL,0,NULL,NULL,'APPROVED','2026-03-26 06:36:48.000000',21),(12,NULL,'2026-03-27 06:36:48.000000',4,12,12,'Gà rán giòn và cay vừa phải, phần ăn khá ổn.',NULL,0,NULL,NULL,'APPROVED','2026-03-27 06:36:48.000000',23),(13,NULL,'2026-03-29 06:36:48.000000',5,13,13,'Salad tươi, sốt mè rang béo vừa, ăn không ngấy.',NULL,0,NULL,NULL,'APPROVED','2026-03-29 06:36:48.000000',25),(14,NULL,'2026-03-30 06:36:48.000000',5,14,14,'Bánh mì giòn, thịt nướng đậm đà, rất đáng tiền.',NULL,0,NULL,NULL,'APPROVED','2026-03-30 06:36:48.000000',27),(15,NULL,'2026-03-31 06:36:48.000000',4,15,15,'Gỏi cuốn tươi và mát, nước chấm ngon.',NULL,0,NULL,NULL,'APPROVED','2026-03-31 06:36:48.000000',29),(16,NULL,'2026-04-01 06:36:48.000000',5,16,1,'Trà sữa thơm, trân châu dẻo vừa, uống rất cuốn.',NULL,0,NULL,NULL,'APPROVED','2026-04-01 06:36:48.000000',28),(17,NULL,'2026-04-01 06:36:48.000000',4,17,2,'Cà phê đậm, sữa vừa phải, hợp gu buổi sáng.',NULL,0,NULL,NULL,'APPROVED','2026-04-01 06:36:48.000000',2),(18,NULL,'2026-04-02 06:36:48.000000',5,18,3,'Nước ép tươi, mát và không bị quá ngọt.',NULL,0,NULL,NULL,'APPROVED','2026-04-02 06:36:48.000000',6),(19,NULL,'2026-04-02 06:36:48.000000',4,19,4,'Chè bưởi béo vừa, cùi bưởi giòn ngon.',NULL,0,NULL,NULL,'APPROVED','2026-04-02 06:36:48.000000',8),(20,NULL,'2026-04-03 06:36:48.000000',5,20,5,'Bánh flan mềm mịn, caramel thơm nhẹ.',NULL,0,NULL,NULL,'APPROVED','2026-04-03 06:36:48.000000',10),(21,NULL,'2026-04-04 06:36:48.000000',5,1,6,'Phở bò ổn định, phần nước dùng rất chất lượng.',NULL,0,NULL,NULL,'APPROVED','2026-04-04 06:36:48.000000',4),(22,NULL,'2026-04-05 06:36:48.000000',4,2,7,'Bún bò khá ngon, vị đậm nhưng vẫn dễ ăn.',NULL,0,NULL,NULL,'APPROVED','2026-04-05 06:36:48.000000',12),(23,NULL,'2026-04-05 06:36:48.000000',5,6,8,'Cơm tấm ngon, đồ ăn đầy đặn, trình bày sạch sẽ.',NULL,0,NULL,NULL,'APPROVED','2026-04-05 06:36:48.000000',14),(24,NULL,'2026-04-06 06:36:48.000000',4,11,9,'Pizza ổn áp, đế giòn, phô mai nhiều.',NULL,0,NULL,NULL,'APPROVED','2026-04-06 06:36:48.000000',16),(25,NULL,'2026-04-07 06:36:48.000000',5,16,10,'Trà sữa ngon, vị đường đen rõ và thơm.',NULL,0,NULL,NULL,'APPROVED','2026-04-07 06:36:48.000000',18),(26,NULL,'2026-04-08 06:36:48.000000',5,14,11,'Bánh mì rất thơm, phần thịt nướng mềm và đậm vị.',NULL,0,NULL,NULL,'APPROVED','2026-04-08 06:36:48.000000',20),(27,NULL,'2026-04-09 08:19:22.717648',5,10,1,'C&aacute; l&oacute;c kh&aacute; ngon','Spam',0,NULL,NULL,'REJECTED','2026-04-09 08:25:56.704903',31),(28,NULL,'2026-04-09 08:19:59.306349',4,9,1,'Kh&ocirc;ng ngon lắm','Spam',0,NULL,NULL,'REJECTED','2026-04-09 08:25:51.268032',32),(29,NULL,'2026-04-09 08:24:29.923910',4,10,1,'Cũng b&igrave;nh thường','Spam',0,NULL,NULL,'REJECTED','2026-04-09 08:25:47.278355',33),(30,NULL,'2026-04-09 08:25:35.391082',5,11,1,'Cũng ngon',NULL,0,NULL,NULL,'APPROVED','2026-04-09 08:25:57.869879',34);


-- ===== RESET SEQUENCES =====
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
SELECT setval('addresses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM addresses));
SELECT setval('carts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM carts));
SELECT setval('banners_id_seq', (SELECT COALESCE(MAX(id), 1) FROM banners));
SELECT setval('promotion_banners_id_seq', (SELECT COALESCE(MAX(id), 1) FROM promotion_banners));
SELECT setval('cart_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cart_items));
SELECT setval('coupons_id_seq', (SELECT COALESCE(MAX(id), 1) FROM coupons));
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));
SELECT setval('order_details_id_seq', (SELECT COALESCE(MAX(id), 1) FROM order_details));
SELECT setval('payments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payments));
SELECT setval('product_images_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_images));
SELECT setval('product_likes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_likes));
SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews));
SELECT setval('cart_reminder_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cart_reminder_logs));
SELECT setval('coupon_usages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM coupon_usages));

-- Dump completed (converted to PostgreSQL)
