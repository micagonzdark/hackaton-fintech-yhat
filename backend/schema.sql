PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS credit_offers;
DROP TABLE IF EXISTS host_cluster_scores;
DROP TABLE IF EXISTS future_bookings;
DROP TABLE IF EXISTS host_monthly_revenue;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS hosts;
DROP TABLE IF EXISTS markets;
DROP TABLE IF EXISTS variable_weights;
DROP TABLE IF EXISTS cluster_weights;

CREATE TABLE cluster_weights (
  cluster_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  weight_pct REAL NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE variable_weights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cluster_key TEXT NOT NULL,
  variable_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  weight_pct REAL NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (cluster_key) REFERENCES cluster_weights(cluster_key)
);

CREATE TABLE markets (
  city TEXT PRIMARY KEY,
  province TEXT NOT NULL,
  destination_type TEXT NOT NULL,
  high_season_months TEXT NOT NULL,
  seasonality_index REAL NOT NULL,
  demand_index INTEGER NOT NULL,
  supply_growth_pct REAL NOT NULL,
  weather_risk INTEGER NOT NULL,
  regulation_risk INTEGER NOT NULL,
  tourism_trend_pct REAL NOT NULL
);

CREATE TABLE hosts (
  host_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  host_tenure_years REAL NOT NULL,
  completed_bookings INTEGER NOT NULL,
  identity_verified INTEGER NOT NULL,
  tax_info_verified INTEGER NOT NULL,
  bank_account_verified INTEGER NOT NULL,
  prior_platform_loans INTEGER NOT NULL,
  prior_loans_repaid INTEGER NOT NULL,
  fraud_flags INTEGER NOT NULL,
  account_suspension_count INTEGER NOT NULL,
  active_listings_count INTEGER NOT NULL,
  FOREIGN KEY (city) REFERENCES markets(city)
);

CREATE TABLE listings (
  listing_id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  capacity_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms REAL NOT NULL,
  amenities_score INTEGER NOT NULL,
  listing_quality_score INTEGER NOT NULL,
  legal_permit_status TEXT NOT NULL,
  calendar_available_days_12m INTEGER NOT NULL,
  relative_price_vs_market REAL NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(host_id)
);

CREATE TABLE host_monthly_revenue (
  revenue_id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id TEXT NOT NULL,
  month TEXT NOT NULL,
  gross_revenue_ars INTEGER NOT NULL,
  net_revenue_ars INTEGER NOT NULL,
  booked_nights INTEGER NOT NULL,
  available_nights INTEGER NOT NULL,
  average_daily_rate_ars INTEGER NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(host_id)
);

CREATE TABLE future_bookings (
  booking_id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  checkin_date TEXT NOT NULL,
  checkout_date TEXT NOT NULL,
  payout_date TEXT NOT NULL,
  gross_value_ars INTEGER NOT NULL,
  cancellation_risk_pct REAL NOT NULL,
  booking_status TEXT NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(host_id),
  FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
);

CREATE TABLE host_cluster_scores (
  host_id TEXT NOT NULL,
  cluster_key TEXT NOT NULL,
  score INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  PRIMARY KEY (host_id, cluster_key),
  FOREIGN KEY (host_id) REFERENCES hosts(host_id),
  FOREIGN KEY (cluster_key) REFERENCES cluster_weights(cluster_key)
);

CREATE TABLE credit_offers (
  offer_id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  requested_amount_ars INTEGER NOT NULL,
  final_score REAL NOT NULL,
  risk_band TEXT NOT NULL,
  decision TEXT NOT NULL,
  expected_future_revenue_p10_ars INTEGER NOT NULL,
  max_advance_ars INTEGER NOT NULL,
  recommended_advance_ars INTEGER NOT NULL,
  fee_pct REAL NOT NULL,
  holdback_pct REAL NOT NULL,
  estimated_repayment_months INTEGER NOT NULL,
  stress_down_30 TEXT NOT NULL,
  stress_down_50 TEXT NOT NULL,
  main_reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (host_id) REFERENCES hosts(host_id)
);

INSERT INTO cluster_weights (cluster_key, display_name, weight_pct, description) VALUES
('host_solidity', 'Solidez del host', 15, 'Confianza histórica del anfitrión dentro de la plataforma.'),
('property_quality', 'Calidad de la propiedad', 15, 'Capacidad del inmueble de generar ingresos futuros.'),
('income_history', 'Historial de ingresos', 25, 'Estabilidad, estacionalidad y volumen de ingresos observados.'),
('reputation_ops', 'Reputación y operación', 15, 'Calidad de experiencia, cancelaciones, reclamos y respuesta.'),
('future_bookings', 'Reservas futuras', 20, 'Flujo futuro observable y parcialmente recuperable.'),
('market_risk', 'Riesgo del mercado', 10, 'Riesgo externo del destino: demanda, clima, oferta y regulación.');

INSERT INTO variable_weights (cluster_key, variable_key, display_name, weight_pct, description) VALUES
('host_solidity', 'host_tenure_years', 'Antigüedad en plataforma', 30, 'Más años reducen incertidumbre.'),
('host_solidity', 'completed_bookings', 'Reservas completadas', 25, 'Mayor historial mejora predictibilidad.'),
('host_solidity', 'identity_tax_bank_verified', 'Verificaciones completas', 15, 'Identidad, fiscal y cuenta bancaria verificadas.'),
('host_solidity', 'platform_behavior', 'Comportamiento en plataforma', 20, 'Fraude, suspensiones e incumplimientos.'),
('host_solidity', 'prior_credit_behavior', 'Adelantos previos', 10, 'Recuperación de adelantos anteriores en la plataforma.'),
('property_quality', 'location_score', 'Ubicación', 25, 'Destino y zona con demanda turística.'),
('property_quality', 'capacity_property_type', 'Tipo y capacidad', 20, 'Ajuste entre inmueble y demanda del destino.'),
('property_quality', 'amenities_score', 'Amenities', 15, 'Servicios que elevan conversión y tarifa.'),
('property_quality', 'listing_quality_score', 'Calidad del listing', 15, 'Fotos, descripción y conversión.'),
('property_quality', 'legal_permit_status', 'Habilitación legal', 15, 'Reduce riesgo regulatorio y operativo.'),
('property_quality', 'calendar_availability', 'Disponibilidad calendario', 10, 'Días disponibles para generar recuperación.'),
('income_history', 'revenue_24_36m', 'Ingresos 24/36 meses', 25, 'Base histórica para estimar flujo futuro.'),
('income_history', 'seasonal_consistency', 'Consistencia estacional', 25, 'Patrón repetible de alta y baja temporada.'),
('income_history', 'revenue_volatility', 'Volatilidad', 20, 'Menor volatilidad mejora el tope de adelanto.'),
('income_history', 'occupancy_history', 'Ocupación histórica', 15, 'Noches ocupadas sobre noches disponibles.'),
('income_history', 'average_daily_rate', 'Precio promedio noche', 10, 'Tarifa capturada por noche vendida.'),
('income_history', 'growth_trend', 'Tendencia', 5, 'Crecimiento o deterioro reciente.'),
('reputation_ops', 'average_rating', 'Rating promedio', 25, 'Calidad percibida por huespedes.'),
('reputation_ops', 'reviews_count', 'Cantidad de reviews', 15, 'Reduce incertidumbre del rating.'),
('reputation_ops', 'rating_trend', 'Tendencia rating', 15, 'Detecta deterioro reciente.'),
('reputation_ops', 'cancellation_rate', 'Tasa de cancelación', 20, 'Cancelaciones elevadas reducen recuperabilidad.'),
('reputation_ops', 'refund_dispute_rate', 'Reembolsos y disputas', 15, 'Incidentes que erosionan ingreso neto.'),
('reputation_ops', 'response_rate', 'Respuesta del host', 10, 'Señal de operación consistente.'),
('future_bookings', 'confirmed_value', 'Valor confirmado', 35, 'Reservas futuras ya observables.'),
('future_bookings', 'future_occupancy', 'Ocupación futura', 20, 'Calendario vendido próximos 90/180 días.'),
('future_bookings', 'payout_schedule', 'Fechas de payout', 15, 'Cuánto tarda en recuperarse el adelanto.'),
('future_bookings', 'cancellation_risk', 'Riesgo de cancelación', 15, 'Parte del flujo futuro que puede desaparecer.'),
('future_bookings', 'booking_lead_time', 'Anticipación de reserva', 15, 'Señal temprana de demanda de temporada.'),
('market_risk', 'destination_seasonality', 'Estacionalidad destino', 25, 'Dependencia de pocos meses fuertes.'),
('market_risk', 'local_demand', 'Demanda turística', 25, 'Demanda agregada del destino.'),
('market_risk', 'supply_growth', 'Crecimiento oferta', 20, 'Competencia nueva en el destino.'),
('market_risk', 'weather_events', 'Clima y eventos', 15, 'Riesgo de nieve, playa, cierres o eventos.'),
('market_risk', 'local_regulation', 'Regulación local', 15, 'Permisos, restricciones y controles.');

INSERT INTO markets (city, province, destination_type, high_season_months, seasonality_index, demand_index, supply_growth_pct, weather_risk, regulation_risk, tourism_trend_pct) VALUES
('Bariloche', 'Rio Negro', 'montana_nieve', 'jun,jul,aug,jan,feb', 0.78, 88, 8.5, 62, 42, 6.0),
('Mar del Plata', 'Buenos Aires', 'costa', 'dec,jan,feb', 0.86, 82, 11.0, 40, 52, 3.0),
('Mendoza', 'Mendoza', 'vino_ciudad', 'mar,apr,jul,oct,nov', 0.42, 76, 6.0, 28, 35, 5.0),
('Villa Gesell', 'Buenos Aires', 'costa', 'dec,jan,feb', 0.91, 68, 14.0, 45, 55, 1.0),
('Buenos Aires', 'CABA', 'urbano', 'mar,apr,oct,nov', 0.25, 86, 9.0, 18, 70, 4.5),
('Ushuaia', 'Tierra del Fuego', 'montana_nieve_naturaleza', 'jul,aug,jan,feb', 0.72, 72, 7.5, 75, 45, 4.0);

INSERT INTO hosts (host_id, display_name, city, host_tenure_years, completed_bookings, identity_verified, tax_info_verified, bank_account_verified, prior_platform_loans, prior_loans_repaid, fraud_flags, account_suspension_count, active_listings_count) VALUES
('H001', 'Lucía - Cabaña Cerro Catedral', 'Bariloche', 8.7, 486, 1, 1, 1, 2, 2, 0, 0, 2),
('H002', 'Martín - Depto Playa Grande', 'Mar del Plata', 5.2, 231, 1, 1, 1, 1, 1, 0, 0, 1),
('H003', 'Sofía - Casa Chacras', 'Mendoza', 4.1, 178, 1, 1, 1, 0, 0, 0, 0, 1),
('H004', 'Nicolás - Monoambiente Nuevo', 'Villa Gesell', 0.8, 19, 1, 0, 1, 0, 0, 0, 0, 1),
('H005', 'Valentina - Loft Palermo', 'Buenos Aires', 6.5, 342, 1, 1, 1, 1, 1, 0, 0, 1),
('H006', 'Agustín - Cabaña Bosque Fueguino', 'Ushuaia', 3.3, 92, 1, 1, 1, 0, 0, 0, 0, 1);

INSERT INTO listings (listing_id, host_id, title, property_type, capacity_guests, bedrooms, bathrooms, amenities_score, listing_quality_score, legal_permit_status, calendar_available_days_12m, relative_price_vs_market) VALUES
('L001', 'H001', 'Cabaña premium cerca del Cerro Catedral', 'cabaña', 6, 3, 2, 92, 88, 'verified', 258, 1.08),
('L002', 'H002', 'Departamento familiar en Playa Grande', 'departamento', 4, 2, 1, 81, 79, 'verified', 242, 0.97),
('L003', 'H003', 'Casa con patio en Chacras de Coria', 'casa', 5, 2, 2, 86, 84, 'verified', 276, 1.03),
('L004', 'H004', 'Monoambiente a 4 cuadras del mar', 'monoambiente', 2, 1, 1, 58, 62, 'pending', 180, 0.82),
('L005', 'H005', 'Loft luminoso en Palermo Hollywood', 'departamento', 3, 1, 1, 89, 86, 'verified', 310, 1.02),
('L006', 'H006', 'Cabaña en bosque fueguino', 'cabaña', 4, 2, 1, 78, 74, 'verified', 220, 1.11);

INSERT INTO host_monthly_revenue (host_id, month, gross_revenue_ars, net_revenue_ars, booked_nights, available_nights, average_daily_rate_ars) VALUES
('H001', '2025-06', 1320000, 1190000, 16, 24, 82500),
('H001', '2025-07', 3400000, 3060000, 27, 29, 125900),
('H001', '2025-08', 3100000, 2790000, 25, 29, 124000),
('H001', '2025-09', 1600000, 1440000, 18, 27, 88900),
('H001', '2025-10', 900000, 810000, 11, 25, 81800),
('H001', '2025-11', 700000, 630000, 9, 24, 77800),
('H001', '2025-12', 1400000, 1260000, 16, 25, 87500),
('H001', '2026-01', 2500000, 2250000, 24, 28, 104200),
('H001', '2026-02', 2000000, 1800000, 21, 26, 95200),
('H001', '2026-03', 1000000, 900000, 12, 25, 83300),
('H001', '2026-04', 550000, 495000, 7, 24, 78600),
('H001', '2026-05', 450000, 405000, 6, 24, 75000),
('H002', '2025-06', 250000, 225000, 5, 23, 50000),
('H002', '2025-07', 360000, 324000, 7, 24, 51400),
('H002', '2025-08', 320000, 288000, 6, 24, 53300),
('H002', '2025-09', 380000, 342000, 7, 24, 54300),
('H002', '2025-10', 550000, 495000, 10, 24, 55000),
('H002', '2025-11', 850000, 765000, 14, 25, 60700),
('H002', '2025-12', 1800000, 1620000, 22, 27, 81800),
('H002', '2026-01', 4200000, 3780000, 29, 30, 144800),
('H002', '2026-02', 3200000, 2880000, 24, 26, 133300),
('H002', '2026-03', 1100000, 990000, 14, 25, 78600),
('H002', '2026-04', 480000, 432000, 8, 24, 60000),
('H002', '2026-05', 280000, 252000, 5, 23, 56000),
('H003', '2025-06', 900000, 810000, 13, 26, 69200),
('H003', '2025-07', 1200000, 1080000, 17, 27, 70600),
('H003', '2025-08', 1050000, 945000, 15, 26, 70000),
('H003', '2025-09', 980000, 882000, 14, 25, 70000),
('H003', '2025-10', 1350000, 1215000, 19, 27, 71100),
('H003', '2025-11', 1450000, 1305000, 20, 27, 72500),
('H003', '2025-12', 1250000, 1125000, 17, 26, 73500),
('H003', '2026-01', 1150000, 1035000, 16, 26, 71900),
('H003', '2026-02', 1020000, 918000, 14, 25, 72900),
('H003', '2026-03', 1550000, 1395000, 21, 28, 73800),
('H003', '2026-04', 1480000, 1332000, 20, 27, 74000),
('H003', '2026-05', 980000, 882000, 14, 25, 70000),
('H004', '2025-06', 0, 0, 0, 20, 0),
('H004', '2025-07', 120000, 108000, 3, 20, 40000),
('H004', '2025-08', 90000, 81000, 2, 20, 45000),
('H004', '2025-09', 0, 0, 0, 18, 0),
('H004', '2025-10', 160000, 144000, 4, 20, 40000),
('H004', '2025-11', 220000, 198000, 5, 21, 44000),
('H004', '2025-12', 800000, 720000, 12, 23, 66700),
('H004', '2026-01', 1400000, 1260000, 20, 24, 70000),
('H004', '2026-02', 1100000, 990000, 16, 22, 68800),
('H004', '2026-03', 400000, 360000, 7, 21, 57100),
('H004', '2026-04', 110000, 99000, 3, 20, 36700),
('H004', '2026-05', 0, 0, 0, 20, 0),
('H005', '2025-06', 1180000, 1062000, 18, 28, 65600),
('H005', '2025-07', 1250000, 1125000, 19, 29, 65800),
('H005', '2025-08', 1300000, 1170000, 20, 29, 65000),
('H005', '2025-09', 1220000, 1098000, 18, 28, 67800),
('H005', '2025-10', 1480000, 1332000, 22, 30, 67300),
('H005', '2025-11', 1520000, 1368000, 22, 30, 69100),
('H005', '2025-12', 1380000, 1242000, 20, 29, 69000),
('H005', '2026-01', 1350000, 1215000, 20, 29, 67500),
('H005', '2026-02', 1280000, 1152000, 19, 28, 67400),
('H005', '2026-03', 1550000, 1395000, 23, 30, 67400),
('H005', '2026-04', 1600000, 1440000, 24, 30, 66700),
('H005', '2026-05', 1400000, 1260000, 21, 29, 66700),
('H006', '2025-06', 620000, 558000, 9, 22, 68900),
('H006', '2025-07', 1850000, 1665000, 20, 25, 92500),
('H006', '2025-08', 1650000, 1485000, 18, 25, 91700),
('H006', '2025-09', 760000, 684000, 10, 22, 76000),
('H006', '2025-10', 520000, 468000, 7, 21, 74300),
('H006', '2025-11', 470000, 423000, 6, 20, 78300),
('H006', '2025-12', 980000, 882000, 12, 23, 81700),
('H006', '2026-01', 1450000, 1305000, 16, 24, 90600),
('H006', '2026-02', 1320000, 1188000, 15, 23, 88000),
('H006', '2026-03', 680000, 612000, 9, 21, 75600),
('H006', '2026-04', 390000, 351000, 5, 20, 78000),
('H006', '2026-05', 310000, 279000, 4, 20, 77500);

INSERT INTO future_bookings (booking_id, host_id, listing_id, checkin_date, checkout_date, payout_date, gross_value_ars, cancellation_risk_pct, booking_status) VALUES
('B001', 'H001', 'L001', '2026-07-05', '2026-07-12', '2026-07-06', 980000, 5.0, 'confirmed'),
('B002', 'H001', 'L001', '2026-07-18', '2026-07-27', '2026-07-19', 1380000, 4.0, 'confirmed'),
('B003', 'H001', 'L001', '2026-08-02', '2026-08-12', '2026-08-03', 1470000, 6.0, 'confirmed'),
('B004', 'H001', 'L001', '2026-08-15', '2026-08-23', '2026-08-16', 1140000, 6.5, 'confirmed'),
('B005', 'H002', 'L002', '2026-12-26', '2027-01-03', '2026-12-27', 1680000, 12.0, 'confirmed'),
('B006', 'H002', 'L002', '2027-01-05', '2027-01-14', '2027-01-06', 2160000, 11.0, 'confirmed'),
('B007', 'H002', 'L002', '2027-02-01', '2027-02-10', '2027-02-02', 1710000, 13.0, 'confirmed'),
('B008', 'H003', 'L003', '2026-07-10', '2026-07-17', '2026-07-11', 630000, 8.0, 'confirmed'),
('B009', 'H003', 'L003', '2026-10-03', '2026-10-10', '2026-10-04', 700000, 7.0, 'confirmed'),
('B010', 'H003', 'L003', '2026-11-14', '2026-11-21', '2026-11-15', 735000, 7.0, 'confirmed'),
('B011', 'H004', 'L004', '2026-12-28', '2027-01-04', '2026-12-29', 420000, 22.0, 'confirmed'),
('B012', 'H005', 'L005', '2026-06-20', '2026-06-27', '2026-06-21', 455000, 8.0, 'confirmed'),
('B013', 'H005', 'L005', '2026-07-08', '2026-07-16', '2026-07-09', 520000, 8.0, 'confirmed'),
('B014', 'H005', 'L005', '2026-08-02', '2026-08-09', '2026-08-03', 462000, 9.0, 'confirmed'),
('B015', 'H006', 'L006', '2026-07-12', '2026-07-20', '2026-07-13', 880000, 14.0, 'confirmed'),
('B016', 'H006', 'L006', '2026-08-04', '2026-08-12', '2026-08-05', 840000, 16.0, 'confirmed');

INSERT INTO host_cluster_scores (host_id, cluster_key, score, explanation) VALUES
('H001', 'host_solidity', 96, '8.7 años, 486 reservas y dos adelantos previos recuperados.'),
('H001', 'property_quality', 88, 'Cabaña premium, permisos verificados y alta disponibilidad.'),
('H001', 'income_history', 91, 'Patrón invierno/verano repetible con baja volatilidad relativa.'),
('H001', 'reputation_ops', 94, 'Rating alto, bajas cancelaciones y pocos reclamos.'),
('H001', 'future_bookings', 86, 'Reservas confirmadas fuertes para julio y agosto.'),
('H001', 'market_risk', 74, 'Destino fuerte pero dependiente de clima y nieve.'),
('H002', 'host_solidity', 82, '5.2 años y 231 reservas completadas.'),
('H002', 'property_quality', 80, 'Buen inmueble costero con permiso verificado.'),
('H002', 'income_history', 76, 'Ingresos altos en verano y baja pronunciada el resto del año.'),
('H002', 'reputation_ops', 78, 'Buen rating con cancelaciones moderadas.'),
('H002', 'future_bookings', 69, 'Reservas de verano confirmadas pero lejanas y cancelables.'),
('H002', 'market_risk', 66, 'Destino muy estacional y oferta competidora creciente.'),
('H003', 'host_solidity', 77, 'Historial suficiente, sin adelantos previos.'),
('H003', 'property_quality', 84, 'Propiedad sólida y habilitada en destino de demanda estable.'),
('H003', 'income_history', 80, 'Ingresos menos estacionales y buena ocupación.'),
('H003', 'reputation_ops', 86, 'Rating y operación consistentes.'),
('H003', 'future_bookings', 62, 'Reservas futuras moderadas distribuidas en el año.'),
('H003', 'market_risk', 78, 'Demanda diversificada y menor riesgo climático.'),
('H004', 'host_solidity', 32, 'Menos de un año y apenas 19 reservas.'),
('H004', 'property_quality', 58, 'Permiso pendiente y listing de baja calidad.'),
('H004', 'income_history', 35, 'Historial corto, meses sin ingreso y alta volatilidad.'),
('H004', 'reputation_ops', 41, 'Cancelaciones altas y rating con poca evidencia.'),
('H004', 'future_bookings', 22, 'Una sola reserva futura con alto riesgo de cancelación.'),
('H004', 'market_risk', 60, 'Destino de playa muy estacional.'),
('H005', 'host_solidity', 88, '6.5 años, 342 reservas y un adelanto recuperado.'),
('H005', 'property_quality', 82, 'Listing urbano fuerte y permiso verificado.'),
('H005', 'income_history', 84, 'Ingresos estables, baja volatilidad y buena ocupación.'),
('H005', 'reputation_ops', 90, 'Excelente operación y rating estable.'),
('H005', 'future_bookings', 58, 'Reservas futuras razonables pero sin gran temporada alta.'),
('H005', 'market_risk', 82, 'Destino urbano con demanda diversificada.'),
('H006', 'host_solidity', 66, 'Historial medio y 92 reservas completadas.'),
('H006', 'property_quality', 76, 'Cabaña atractiva pero más dependiente de condiciones externas.'),
('H006', 'income_history', 59, 'Ingresos estacionales con volatilidad significativa.'),
('H006', 'reputation_ops', 68, 'Rating aceptable con cancelaciones y reclamos moderados.'),
('H006', 'future_bookings', 57, 'Dos reservas invernales confirmadas con riesgo medio.'),
('H006', 'market_risk', 50, 'Riesgo climático alto y demanda menos profunda.');

INSERT INTO credit_offers (offer_id, host_id, requested_amount_ars, final_score, risk_band, decision, expected_future_revenue_p10_ars, max_advance_ars, recommended_advance_ars, fee_pct, holdback_pct, estimated_repayment_months, stress_down_30, stress_down_50, main_reason, created_at) VALUES
('O001', 'H001', 2800000, 89.0, 'bajo', 'approved', 11800000, 3200000, 2500000, 10.0, 28.0, 3, 'recuperación probable', 'recuperación con extensión', 'Host histórico con alta reputación y reservas fuertes de invierno.', '2026-06-05'),
('O002', 'H002', 1800000, 75.4, 'medio', 'approved', 5200000, 1700000, 1150000, 14.0, 32.0, 4, 'recuperación probable', 'riesgo parcial', 'Buena temporada futura, pero destino muy estacional y reservas lejanas.', '2026-06-05'),
('O003', 'H003', 1000000, 77.2, 'medio_bajo', 'approved', 4100000, 1200000, 700000, 12.0, 22.0, 3, 'recuperación probable', 'recuperación probable con menor margen', 'Buen perfil, aunque la necesidad de smoothing es menor.', '2026-06-05'),
('O004', 'H004', 700000, 38.8, 'alto', 'rejected', 900000, 0, 0, 0.0, 0.0, 0, 'no aplica', 'no aplica', 'Historial insuficiente, permiso pendiente y alto riesgo de cancelación.', '2026-06-05'),
('O005', 'H005', 900000, 79.8, 'medio_bajo', 'approved', 3600000, 950000, 500000, 11.0, 18.0, 2, 'recuperación probable', 'recuperación probable', 'Host excelente, pero ingresos urbanos estables reducen necesidad estacional.', '2026-06-05'),
('O006', 'H006', 900000, 62.6, 'medio_alto', 'pilot_line', 2400000, 650000, 420000, 18.0, 35.0, 4, 'riesgo parcial', 'alto riesgo', 'Línea piloto por volatilidad, clima y reservas futuras acotadas.', '2026-06-05');
