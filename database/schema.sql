-- ==========================
-- Hospital Database Schema
-- ==========================

-- Table: Hospitals
CREATE TABLE Hospitals (
    hospital_id SERIAL PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    address TEXT,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    website_url VARCHAR(255),
    map_latitude DECIMAL(10,6),
    map_longitude DECIMAL(10,6),
    established_year INT,
    ownership_type VARCHAR(50), -- Government, Private, Trust, Corporate
    accreditation VARCHAR(100),
    rating DECIMAL(2,1)
);

-- Table: Facilities
CREATE TABLE Facilities (
    facility_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    facility_type VARCHAR(50), -- ICU, NICU, OT, Ambulance, Pharmacy, Lab, Emergency
    capacity INT,
    charges DECIMAL(10,2),
    availability_status BOOLEAN DEFAULT TRUE
);

-- Table: Beds
CREATE TABLE Beds (
    bed_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    bed_type VARCHAR(50), -- General, Semi-Private, Private, Deluxe, ICU, NICU
    total_beds INT,
    available_beds INT,
    daily_charges DECIMAL(10,2)
);

-- Table: Doctors
CREATE TABLE Doctors (
    doctor_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    years_experience INT,
    qualification VARCHAR(255),
    consultation_fee DECIMAL(10,2),
    availability_hours VARCHAR(100)
);

-- Table: Procedures
CREATE TABLE Procedures (
    procedure_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    procedure_name VARCHAR(255) NOT NULL,
    base_cost DECIMAL(10,2),
    additional_charges TEXT,
    insurance_coverage BOOLEAN DEFAULT FALSE
);

-- Table: Insurance Partners
CREATE TABLE InsurancePartners (
    insurance_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    policy_types TEXT,
    negotiated_discount DECIMAL(5,2), -- percentage
    recommendation_flag BOOLEAN DEFAULT FALSE
);

-- Table: Reviews
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    hospital_id INT REFERENCES Hospitals(hospital_id) ON DELETE CASCADE,
    patient_name VARCHAR(255),
    rating DECIMAL(2,1),
    review_text TEXT,
    date DATE DEFAULT CURRENT_DATE
);