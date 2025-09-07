#!/usr/bin/env bash
set -euo pipefail

# ----------------------------
# Parámetros (puedes sobreescribir por env)
# ----------------------------
DB_NAME="${DB_NAME:-attendance_db}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-Camilo12345_}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

echo "==> Creando base de datos y esquema en MySQL (${DB_HOST}:${DB_PORT}) ..."

mysql_base_flags=(-h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASS}" -N -B)

# Detectar collation disponible (orden de preferencia)
detect_collation() {
  local candidates=("utf8mb4_0900_ai_ci" "utf8mb4_uca1400_ai_ci" "utf8mb4_unicode_ci" "utf8mb4_general_ci")
  for col in "${candidates[@]}"; do
    if mysql "${mysql_base_flags[@]}" -e "SELECT 1 FROM INFORMATION_SCHEMA.COLLATIONS WHERE COLLATION_NAME='${col}';" | grep -q 1; then
      echo "${col}"
      return 0
    fi
  done
  echo "utf8mb4_unicode_ci"
}

DB_CHARSET="utf8mb4"
DB_COLLATION="$(detect_collation)"
echo "==> Usando charset=${DB_CHARSET}, collation=${DB_COLLATION}"

mysql_exec() {
  mysql "${mysql_base_flags[@]}" -e "$1"
}

# 1) Crear BD si no existe con charset/collation compatibles
mysql_exec "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
  DEFAULT CHARACTER SET ${DB_CHARSET}
  DEFAULT COLLATE ${DB_COLLATION};"

# 2) DDL
mysql_exec "USE \`${DB_NAME}\`;

SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS shifts (
  id CHAR(1) PRIMARY KEY,            -- 'A' o 'B'
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=${DB_CHARSET} COLLATE=${DB_COLLATION};

CREATE TABLE IF NOT EXISTS shift_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_id CHAR(1) NOT NULL,
  block_order TINYINT NOT NULL,      -- 1 o 2
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  ends_next_day TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_shift_block (shift_id, block_order),
  CONSTRAINT fk_shift_blocks_shift
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=${DB_CHARSET} COLLATE=${DB_COLLATION};

CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,        -- Ej: 'E-12345'
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  names VARCHAR(100) NOT NULL,
  surnames VARCHAR(100) NOT NULL,
  shift_id CHAR(1) NOT NULL,         -- 'A' o 'B'
  CONSTRAINT fk_employees_shift
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=${DB_CHARSET} COLLATE=${DB_COLLATION};

CREATE TABLE IF NOT EXISTS attendances (
  id VARCHAR(64) PRIMARY KEY,                   -- UUID generado por la app
  employee_id VARCHAR(50) NOT NULL,
  ts_utc DATETIME NOT NULL,                     -- UTC (ej. 2025-09-15T06:05:10Z)
  type ENUM('ENTRADA','SALIDA') NOT NULL,       -- RNF exige estos valores
  CONSTRAINT fk_att_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  KEY idx_att_emp_ts (employee_id, ts_utc),
  KEY idx_att_ts (ts_utc)
) ENGINE=InnoDB DEFAULT CHARSET=${DB_CHARSET} COLLATE=${DB_COLLATION};

INSERT INTO shifts (id, name, description) VALUES
  ('A','Turno A','06:00-10:00 y 11:00-15:00 (descanso 10:00-11:00)'),
  ('B','Turno B','15:00-19:00 y 20:00-00:00 (descanso 19:00-20:00)')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

INSERT INTO shift_blocks (shift_id, block_order, start_time, end_time, ends_next_day) VALUES
  ('A', 1, '06:00:00', '10:00:00', 0),
  ('A', 2, '11:00:00', '15:00:00', 0),
  ('B', 1, '15:00:00', '19:00:00', 0),
  ('B', 2, '20:00:00', '00:00:00', 1)
ON DUPLICATE KEY UPDATE
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  ends_next_day = VALUES(ends_next_day);

INSERT INTO employees (id, employee_code, names, surnames, shift_id) VALUES
  ('E-12345','E-12345','Empleado','Ejemplo','A')

ON DUPLICATE KEY UPDATE
  employee_code = VALUES(employee_code),
  names = VALUES(names),
  surnames = VALUES(surnames),
  shift_id = VALUES(shift_id);
"

echo "==> Esquema creado/actualizado en '${DB_NAME}'."
echo "==> Tablas:"
mysql_exec "USE \`${DB_NAME}\`; SHOW TABLES;"
echo "==> Turnos y bloques:"
mysql_exec "USE \`${DB_NAME}\`; SELECT * FROM shifts; SELECT shift_id, block_order, start_time, end_time, ends_next_day FROM shift_blocks ORDER BY shift_id, block_order;"
echo "==> Ejemplo de empleado:"
mysql_exec "USE \`${DB_NAME}\`; SELECT id, employee_code, names, surnames, shift_id FROM employees;"


