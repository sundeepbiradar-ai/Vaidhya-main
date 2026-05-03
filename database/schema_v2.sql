-- Core user and role schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    name VARCHAR(50) PRIMARY KEY,
    description TEXT
);

INSERT INTO roles (name, description) VALUES
('patient', 'Patient user'),
('doctor', 'Doctor user'),
('hospital_admin', 'Hospital administrator'),
('admin', 'Platform administrator');

-- Hospital model
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(128) NOT NULL,
    state VARCHAR(128),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website_url VARCHAR(255),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    rating NUMERIC(2,1) DEFAULT 0,
    emergency BOOLEAN DEFAULT FALSE,
    specialties TEXT[],
    insurance_partners TEXT[],
    unique_key VARCHAR(512) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hospitals_city ON hospitals (city);
CREATE INDEX idx_hospitals_location ON hospitals (latitude, longitude);
CREATE INDEX idx_hospitals_rating ON hospitals (rating DESC);

CREATE TABLE specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL
);

CREATE TABLE hospital_specializations (
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    specialization_id INT REFERENCES specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (hospital_id, specialization_id)
);

CREATE TABLE insurance_partners (
    id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    policy_types TEXT[],
    negotiated_discount NUMERIC(5,2),
    recommendation_flag BOOLEAN DEFAULT FALSE
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(128),
    expertise TEXT[],
    years_experience INT DEFAULT 0,
    qualification VARCHAR(255),
    consultation_fee NUMERIC(10,2),
    consultation_types TEXT[],
    availability_slots JSONB,
    profile_image_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_specialization ON doctors (specialization);
CREATE INDEX idx_doctors_expertise ON doctors USING gin (expertise gin_trgm_ops);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    hospital_id INT REFERENCES hospitals(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    slot VARCHAR(64) NOT NULL,
    consultation_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_id, appointment_date, slot)
);

CREATE INDEX idx_appointments_patient ON appointments (patient_id);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    patient_id INT REFERENCES users(id) ON DELETE SET NULL,
    rating NUMERIC(2,1) NOT NULL,
    comment TEXT,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_hospital ON reviews (hospital_id);

CREATE TABLE media_assets (
    id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    s3_key VARCHAR(512) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    type VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE availability_slots (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL
);

CREATE INDEX idx_availability_doctor ON availability_slots (doctor_id);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
