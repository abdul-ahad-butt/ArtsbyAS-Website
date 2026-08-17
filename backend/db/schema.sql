DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS canvases;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE canvases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  dimensions TEXT,
  price_pkr INTEGER NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK(status IN ('available', 'sold', 'hidden')) DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  courier TEXT NOT NULL,
  canvas_id INTEGER NOT NULL,
  payment_screenshot_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending_verification', 'verified', 'rejected', 'dispatched')) DEFAULT 'pending_verification',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  FOREIGN KEY (canvas_id) REFERENCES canvases(id)
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default admin user
INSERT INTO admin_users (username, password_hash) VALUES ('admin', 'AS@Arts100.');
