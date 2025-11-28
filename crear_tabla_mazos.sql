-- Crear tabla de mazos guardados
CREATE TABLE IF NOT EXISTS `mazos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `nombre` VARCHAR(255) NOT NULL,
  `mitologia` VARCHAR(100),
  `mazo_data` LONGTEXT NOT NULL, -- JSON con cartas y datos del mazo
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  INDEX (`usuario_id`),
  INDEX (`fecha_actualizacion`)
);
