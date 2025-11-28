-- Crear tabla de noticias
CREATE TABLE IF NOT EXISTS noticias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  imagen_url VARCHAR(500),
  resumen TEXT NOT NULL,
  contenido LONGTEXT NOT NULL,
  es_destacada BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar noticias de ejemplo
INSERT INTO noticias (titulo, fecha, imagen_url, resumen, contenido, es_destacada) VALUES
('Nueva Expansión: Era V Revelada', '2025-11-26', 'https://placehold.co/600x400/3b0066/ffffff?text=Expansion', 
'Descubre las nuevas mitologías y cartas que llegarán en la próxima expansión. Más de 200 cartas nuevas esperan a los jugadores.',
'<h3>Nueva Expansión Era V: Revelada</h3><p>Después de meses de anticipación, finalmente podemos revelar los detalles de Era V. Esta expansión trae consigo 200+ cartas nuevas que enriquecerán el metagame actual.</p><p><strong>Nuevas Mitologías:</strong></p><ul><li>Celtas Antiguos</li><li>Hindú Clásico</li><li>Mesoamericanas Perdidas</li></ul><p>La expansión estará disponible a partir del 15 de diciembre de 2025.</p>',
TRUE),

('Torneo Anual 2025', '2025-11-22', 'https://placehold.co/300x200/3b0066/ffffff?text=Torneo',
'¡Inscripciones abiertas! Compite por premios épicos.',
'<h3>Torneo Anual 2025 - Competición Global</h3><p>Este año presentamos el mayor torneo de The Conjurer con un premio total de $50,000.</p><p><strong>Formato:</strong> Best-of-3 / Eliminatoria suiza</p><p><strong>Fases:</strong></p><ol><li>Clasificatoria Regional (Diciembre)</li><li>Semifinal Continental (Enero)</li><li>Gran Final Mundial (Febrero)</li></ol>',
FALSE),

('Cambios de Balance Octubre', '2025-11-20', 'https://placehold.co/300x200/3b0066/ffffff?text=Balance',
'Se anuncian los ajustes para equilibrar el metagame.',
'<h3>Parche de Balance - Noviembre 2025</h3><p>Basándonos en el análisis de datos de torneos y juego casual, hemos identificado algunas cartas que necesitaban ajustes.</p><p><strong>Cambios principales:</strong></p><ul><li><strong>[Nerfed]</strong> Invocación del Primigenio: Coste aumentado a 8 (era 7)</li><li><strong>[Buffed]</strong> Guerrero Nórdico: +1 de fuerza</li></ul>',
FALSE),

('Evento Especial: Doble XP', '2025-11-18', 'https://placehold.co/300x200/3b0066/ffffff?text=Evento',
'Fin de semana con ganancias duplicadas en batalla.',
'<h3>Fin de Semana Especial - Doble XP</h3><p>Este próximo fin de semana (23-24 de noviembre) todos los jugadores podrán ganar el doble de experiencia en las batallas clasificadas.</p>',
FALSE),

('Parche v2.3.1 Disponible', '2025-11-15', 'https://placehold.co/300x200/3b0066/ffffff?text=Parche',
'Correcciones de bugs y mejoras de rendimiento.',
'<h3>Parche v2.3.1 - Notas de Actualización</h3><p>Lanzamiento de correcciones críticas y mejoras de rendimiento.</p><p><strong>Bug Fixes:</strong></p><ul><li>Corregido bug en modal de cartas</li><li>Mejorado rendimiento del deckbuilder</li></ul>',
FALSE);
