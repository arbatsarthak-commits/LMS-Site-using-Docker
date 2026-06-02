-- Student Management System schema
-- Database: student_management

CREATE DATABASE IF NOT EXISTS student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','student') NOT NULL DEFAULT 'student',
  api_token VARCHAR(128) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SET @users_password_col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password'
);
SET @users_password_col_sql := IF(
  @users_password_col_exists = 0,
  'ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER username',
  'SELECT 1'
);
PREPARE stmt FROM @users_password_col_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(128) NOT NULL,
  course VARCHAR(64) NOT NULL,
  faculty VARCHAR(128) NOT NULL DEFAULT '',
  front_office VARCHAR(128) NOT NULL DEFAULT '',
  lab_instructor VARCHAR(128) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  role ENUM('teacher','front_office','lab_instructor') NOT NULL,
  course_assigned VARCHAR(64) NOT NULL DEFAULT '',
  payment_type VARCHAR(32) NOT NULL DEFAULT 'per_student_incentive',
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  student_id INT NULL,
  course_id INT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('paid','pending','failed') NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(128) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_course (user_id, course_id),
  CONSTRAINT fk_regs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_regs_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Seed default courses
INSERT IGNORE INTO courses (name, fee) VALUES
  ('MSCIT', 700),
  ('Module', 1000),
  ('149', 149),
  ('DCFA', 0),
  ('DCP', 0),
  ('DDA', 0),
  ('DGDA', 0);

-- Upgrade existing staff table (older installs)
SET @staff_ca := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff' AND COLUMN_NAME = 'course_assigned'
);
SET @staff_ca_sql := IF(
  @staff_ca = 0,
  'ALTER TABLE staff ADD COLUMN course_assigned VARCHAR(64) NOT NULL DEFAULT \'\' AFTER role',
  'SELECT 1'
);
PREPARE staff_ca_stmt FROM @staff_ca_sql;
EXECUTE staff_ca_stmt;
DEALLOCATE PREPARE staff_ca_stmt;

SET @staff_pt := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff' AND COLUMN_NAME = 'payment_type'
);
SET @staff_pt_sql := IF(
  @staff_pt = 0,
  'ALTER TABLE staff ADD COLUMN payment_type VARCHAR(32) NOT NULL DEFAULT \'per_student_incentive\' AFTER course_assigned',
  'SELECT 1'
);
PREPARE staff_pt_stmt FROM @staff_pt_sql;
EXECUTE staff_pt_stmt;
DEALLOCATE PREPARE staff_pt_stmt;

-- Seed admin user (username: admin, password: 123)
INSERT IGNORE INTO users (username, password_hash, role)
VALUES ('admin', '$2y$10$Ah94TmXyvQHlWeZtw6IxpeU/ahUZc9d38gnUAFnz/AQE4DhWXvaEC', 'admin');

UPDATE users SET password = '123' WHERE username = 'admin';

-- Seed student user (username: student1, password: 123)
INSERT IGNORE INTO users (username, password_hash, password, role)
VALUES (
  'student1',
  '$2y$10$Ah94TmXyvQHlWeZtw6IxpeU/ahUZc9d38gnUAFnz/AQE4DhWXvaEC',
  '123',
  'student'
);

