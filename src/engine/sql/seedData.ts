export const SCHEMA_SQL = `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  clearance_level INTEGER NOT NULL,
  hired_at TEXT NOT NULL
);

CREATE TABLE access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  employee_id INTEGER,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  resource TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  sender_account TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  flagged INTEGER DEFAULT 0
);
`;

export const SEED_SQL = `
-- Employees
INSERT INTO employees (id, name, role, department, clearance_level, hired_at) VALUES
(101, 'Marcus Vance', 'Lead Cloud Architect', 'Infrastructure', 4, '2022-03-15'),
(102, 'Elena Rostova', 'Senior DBA', 'Data Engineering', 4, '2021-08-01'),
(103, 'David Chen', 'SecOps Engineer', 'Information Security', 3, '2023-01-10'),
(104, 'Sophia Lin', 'VP of Treasury', 'Finance', 5, '2020-05-19'),
(105, 'Tariq Al-Mansoor', 'DevOps Specialist', 'Infrastructure', 3, '2023-06-22'),
(106, 'Clara Oswald', 'Financial Analyst', 'Finance', 2, '2024-02-01'),
(107, 'Arthur Pendelton', 'Chief Risk Officer', 'Executive', 5, '2019-11-04');

-- Access Logs
INSERT INTO access_logs (timestamp, employee_id, ip_address, action, status, resource) VALUES
('2026-09-10 22:14:02', 101, '10.0.4.12', 'LOGIN', 'SUCCESS', '/admin/console'),
('2026-09-10 23:45:11', NULL, '198.51.100.77', 'LOGIN', 'FAILED', '/auth/login'),
('2026-09-10 23:45:19', NULL, '198.51.100.77', 'LOGIN', 'FAILED', '/auth/login'),
('2026-09-10 23:45:30', NULL, '198.51.100.77', 'LOGIN', 'FAILED', '/auth/login'),
('2026-09-10 23:46:01', NULL, '198.51.100.77', 'LOGIN', 'SUCCESS', '/auth/login'),
('2026-09-10 23:48:15', NULL, '198.51.100.77', 'PRIV_ESCALATE', 'SUCCESS', '/vault/keys'),
('2026-09-11 01:12:44', 102, '10.0.8.50', 'LOGIN', 'SUCCESS', '/data/query'),
('2026-09-11 02:04:18', 101, '198.51.100.77', 'DB_EXPORT', 'SUCCESS', '/finance/export'),
('2026-09-11 02:15:33', 105, '10.0.4.88', 'LOGIN', 'SUCCESS', '/ci/pipeline'),
('2026-09-11 03:00:22', 103, '10.0.2.14', 'LOGIN', 'SUCCESS', '/security/siem'),
('2026-09-11 03:22:10', 101, '198.51.100.77', 'KEY_ROTATION', 'FAILED', '/vault/keys'),
('2026-09-11 04:05:59', 106, '10.0.6.12', 'LOGIN', 'SUCCESS', '/finance/reports'),
('2026-09-11 04:40:12', 104, '10.0.6.99', 'LOGIN', 'SUCCESS', '/finance/wire_auth');

-- Transactions
INSERT INTO transactions (timestamp, sender_account, recipient_account, amount, currency, flagged) VALUES
('2026-09-11 02:10:00', 'CORP-OPS-9901', 'ACCT-VENDOR-774', 14500.00, 'USD', 0),
('2026-09-11 02:14:19', 'CORP-OPS-9901', 'ACCT-VENDOR-112', 3200.50, 'USD', 0),
('2026-09-11 02:30:45', 'CORP-TREASURY-01', 'ACCT-SHADOW-X9', 750000.00, 'USD', 1),
('2026-09-11 02:31:12', 'CORP-TREASURY-01', 'ACCT-SHADOW-X9', 850000.00, 'USD', 1),
('2026-09-11 02:31:55', 'CORP-TREASURY-01', 'ACCT-SHADOW-X9', 900000.00, 'USD', 1),
('2026-09-11 03:05:00', 'CORP-PAYROLL-04', 'ACCT-EMP-101', 8200.00, 'USD', 0),
('2026-09-11 03:05:00', 'CORP-PAYROLL-04', 'ACCT-EMP-102', 7800.00, 'USD', 0),
('2026-09-11 03:15:30', 'CORP-OPS-9901', 'ACCT-VENDOR-883', 45000.00, 'USD', 0),
('2026-09-11 04:00:10', 'CORP-TREASURY-01', 'ACCT-OFFSHORE-707', 1200000.00, 'USD', 1),
('2026-09-11 04:12:00', 'CORP-OPS-9901', 'ACCT-LEGAL-440', 18000.00, 'USD', 0);
`;
