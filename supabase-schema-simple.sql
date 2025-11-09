-- Esquema simplificado para la aplicación de apuestas de F1
-- Sin user_sessions para evitar problemas de claves foráneas

-- Limpiar tablas existentes si existen
DROP TABLE IF EXISTS race_results CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS races CASCADE;
DROP TABLE IF EXISTS pilots CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios simplificada
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  session_token VARCHAR(255), -- Token de sesión directamente en users
  session_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_session_token ON users(session_token);

-- Tabla de pilotos
CREATE TABLE pilots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  team VARCHAR(100) NOT NULL,
  number INTEGER NOT NULL UNIQUE,
  country VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carreras
CREATE TABLE races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  start_datetime TIMESTAMP WITH TIME ZONE,
  race_type VARCHAR(20) DEFAULT 'normal' CHECK (race_type IN ('normal', 'sprint')),
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de apuestas
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  predictions JSONB NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- Tabla de resultados reales de carreras
CREATE TABLE race_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  position_1 UUID REFERENCES pilots(id),
  position_2 UUID REFERENCES pilots(id),
  position_3 UUID REFERENCES pilots(id),
  position_4 UUID REFERENCES pilots(id),
  position_5 UUID REFERENCES pilots(id),
  position_6 UUID REFERENCES pilots(id),
  position_7 UUID REFERENCES pilots(id),
  position_8 UUID REFERENCES pilots(id),
  position_9 UUID REFERENCES pilots(id),
  position_10 UUID REFERENCES pilots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(race_id)
);

-- Insertar pilotos de F1 2025
INSERT INTO pilots (name, team, number, country) VALUES
('Max Verstappen', 'Red Bull Racing', 1, 'Netherlands'),
('Liam Lawson', 'Red Bull Racing', 30, 'New Zealand'),
('George Russell', 'Mercedes', 63, 'United Kingdom'),
('Andrea Kimi Antonelli', 'Mercedes', 12, 'Italy'),
('Charles Leclerc', 'Ferrari', 16, 'Monaco'),
('Lewis Hamilton', 'Ferrari', 44, 'United Kingdom'),
('Lando Norris', 'McLaren', 4, 'United Kingdom'),
('Oscar Piastri', 'McLaren', 81, 'Australia'),
('Fernando Alonso', 'Aston Martin', 14, 'Spain'),
('Lance Stroll', 'Aston Martin', 18, 'Canada'),
('Pierre Gasly', 'Alpine', 10, 'France'),
('Jack Doohan', 'Alpine', 7, 'Australia'),
('Yuki Tsunoda', 'Racing Bulls', 22, 'Japan'),
('Isack Hadjar', 'Racing Bulls', 6, 'France'),
('Alexander Albon', 'Williams', 23, 'Thailand'),
('Carlos Sainz', 'Williams', 55, 'Spain'),
('Nico Hülkenberg', 'Sauber', 27, 'Germany'),
('Gabriel Bortoleto', 'Sauber', 5, 'Brazil'),
('Oliver Bearman', 'Haas', 50, 'United Kingdom'),
('Esteban Ocon', 'Haas', 31, 'France');

-- Insertar carreras de F1 2025
INSERT INTO races (name, location, date, race_type, status) VALUES
('Chinese Grand Prix', 'Shanghai International Circuit', '2025-03-23', 'sprint', 'upcoming'),
('Japanese Grand Prix', 'Suzuka International Racing Course', '2025-04-13', 'normal', 'upcoming'),
('Bahrain Grand Prix', 'Bahrain International Circuit', '2025-04-20', 'sprint', 'upcoming'),
('Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', '2025-05-04', 'normal', 'upcoming'),
('Miami Grand Prix', 'Miami International Autodrome', '2025-05-11', 'sprint', 'upcoming'),
('Monaco Grand Prix', 'Circuit de Monaco', '2025-05-25', 'normal', 'upcoming'),
('Spanish Grand Prix', 'Circuit de Barcelona-Catalunya', '2025-06-01', 'normal', 'upcoming'),
('Canadian Grand Prix', 'Circuit Gilles Villeneuve, Montreal', '2025-06-15', 'normal', 'upcoming'),
('British Grand Prix', 'Silverstone Circuit', '2025-07-06', 'normal', 'upcoming'),
('Belgian Grand Prix', 'Circuit de Spa-Francorchamps', '2025-07-27', 'normal', 'upcoming'),
('Hungarian Grand Prix', 'Hungaroring, Budapest', '2025-08-03', 'normal', 'upcoming'),
('Italian Grand Prix', 'Autodromo Nazionale di Monza', '2025-09-07', 'normal', 'upcoming'),
('Singapore Grand Prix', 'Marina Bay Street Circuit', '2025-10-05', 'normal', 'upcoming'),
('United States Grand Prix', 'Circuit of the Americas, Austin', '2025-10-19', 'sprint', 'upcoming'),
('Brazil Grand Prix', 'Interlagos Circuit, São Paulo', '2025-11-09', 'sprint', 'upcoming'),
('Abu Dhabi Grand Prix', 'Yas Marina Circuit', '2025-12-07', 'normal', 'upcoming');

-- Deshabilitar Row Level Security
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE races DISABLE ROW LEVEL SECURITY;
ALTER TABLE pilots DISABLE ROW LEVEL SECURITY;
ALTER TABLE race_results DISABLE ROW LEVEL SECURITY;