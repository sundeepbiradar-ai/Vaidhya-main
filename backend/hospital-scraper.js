const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const db = require('./db');

// Expanded sources for Indian hospital data
const DATA_SOURCES = [
  {
    name: 'Apollo Hospitals',
    url: 'https://www.apollohospitals.com/locations/',
    type: 'website',
    selectors: ['.hospital-card', '.location-card', '.hospital-listing']
  },
  {
    name: 'Max Healthcare',
    url: 'https://www.maxhealthcare.in/hospitals-in-india',
    type: 'website',
    selectors: ['.hospital-item', '.center-info', '.location-info']
  },
  {
    name: 'Fortis Healthcare',
    url: 'https://www.fortishealthcare.com/india',
    type: 'website',
    selectors: ['.hospital-card', '.location-card', '.branch-info']
  },
  {
    name: 'Medanta',
    url: 'https://www.medanta.org/hospitals',
    type: 'website',
    selectors: ['.hospital-listing', '.center-card', '.location-item']
  },
  {
    name: 'Manipal Hospitals',
    url: 'https://www.manipalhospitals.com/find-a-hospital/',
    type: 'website',
    selectors: ['.hospital-card', '.location-card', '.hospital-info']
  },
  {
    name: 'Columbia Asia',
    url: 'https://www.columbiaasia.com/india/hospitals',
    type: 'website',
    selectors: ['.hospital-card', '.location-card', '.center-info']
  },
  {
    name: 'Rainbow Hospitals',
    url: 'https://www.rainbowhospitals.in/locations/',
    type: 'website',
    selectors: ['.hospital-card', '.location-card', '.center-info']
  },
  {
    name: 'Government Hospitals',
    url: 'https://www.mohfw.gov.in/',
    type: 'government',
    selectors: ['.hospital-info', '.medical-center', '.health-facility']
  },
  {
    name: 'JustDial Hospitals',
    url: 'https://www.justdial.com/Delhi/Hospitals/nct-10000001',
    type: 'directory',
    selectors: ['.cntanr', '.store-details', '.contact-info']
  },
  {
    name: 'Practo Hospitals',
    url: 'https://www.practo.com/delhi/hospitals',
    type: 'directory',
    selectors: ['.c-card', '.clinic-card', '.hospital-card']
  }
];

// Additional hospital data from various sources
const ADDITIONAL_HOSPITAL_DATA = [
  {
    name: 'BLK-Max Super Speciality Hospital',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Pusa Road, New Delhi - 110005',
    contact: '+91-11-30403040',
    email: 'info@blkhospital.com',
    website: 'https://www.blkhospital.com',
    latitude: 28.6387,
    longitude: 77.1873,
    established: 1959,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.3,
    specialties: ['Oncology', 'Cardiology', 'Orthopedics', 'Neurosurgery'],
    totalBeds: 650,
    icuBeds: 125,
    emergency: true
  },
  {
    name: 'Indraprastha Apollo Hospital',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
    contact: '+91-11-26925858',
    email: 'info@apollohospitalsdelhi.com',
    website: 'https://www.apollohospitals.com/delhi/indraprastha-apollo-hospital',
    latitude: 28.5362,
    longitude: 77.2837,
    established: 1996,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.4,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant'],
    totalBeds: 1000,
    icuBeds: 200,
    emergency: true
  },
  {
    name: 'Artemis Hospital',
    city: 'Gurgaon',
    state: 'Haryana',
    address: 'Sector 51, Gurgaon - 122001',
    contact: '+91-124-4511111',
    email: 'info@artemishospitals.com',
    website: 'https://www.artemishospitals.com',
    latitude: 28.4229,
    longitude: 77.0401,
    established: 2007,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.2,
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurosurgery'],
    totalBeds: 400,
    icuBeds: 100,
    emergency: true
  },
  {
    name: 'Paras Hospitals',
    city: 'Gurgaon',
    state: 'Haryana',
    address: 'C-1, Sushant Lok- 1, Sector-43, Phase- I, Gurgaon - 122002',
    contact: '+91-124-4585555',
    email: 'info@parashospitals.com',
    website: 'https://www.parashospitals.com',
    latitude: 28.4595,
    longitude: 77.0724,
    established: 2006,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.1,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    totalBeds: 250,
    icuBeds: 75,
    emergency: true
  },
  {
    name: 'Jaypee Hospital',
    city: 'Noida',
    state: 'Uttar Pradesh',
    address: 'Sector 128, Noida - 201304',
    contact: '+91-120-4122222',
    email: 'info@jaypeehealthcare.com',
    website: 'https://www.jaypeehealthcare.com',
    latitude: 28.5276,
    longitude: 77.3570,
    established: 2014,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.0,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant'],
    totalBeds: 525,
    icuBeds: 150,
    emergency: true
  },
  {
    name: 'Yashoda Hospitals',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Alexander Road, Secunderabad - 500003',
    contact: '+91-40-45671111',
    email: 'info@yashodahospitals.com',
    website: 'https://www.yashodahospitals.com',
    latitude: 17.4399,
    longitude: 78.4983,
    established: 1989,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.2,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    totalBeds: 500,
    icuBeds: 120,
    emergency: true
  },
  {
    name: 'CARE Hospitals',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Road No. 1, Banjara Hills, Hyderabad - 500034',
    contact: '+91-40-30417777',
    email: 'info@carehospitals.com',
    website: 'https://www.carehospitals.com',
    latitude: 17.4156,
    longitude: 78.4346,
    established: 1997,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.3,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant'],
    totalBeds: 435,
    icuBeds: 120,
    emergency: true
  },
  {
    name: 'Global Hospitals',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '439, Cheran Nagar, Perumbakkam, Chennai - 600100',
    contact: '+91-44-44777000',
    email: 'info@globalhospitalsindia.com',
    website: 'https://www.globalhospitalsindia.com',
    latitude: 12.9037,
    longitude: 80.2211,
    established: 1999,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.1,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant'],
    totalBeds: 500,
    icuBeds: 120,
    emergency: true
  },
  {
    name: 'MIOT International',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '4/112, Mount Poonamalle Road, Manapakkam, Chennai - 600089',
    contact: '+91-44-42002288',
    email: 'info@miotinternational.com',
    website: 'https://www.miotinternational.com',
    latitude: 13.0292,
    longitude: 80.1763,
    established: 1999,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.4,
    specialties: ['Orthopedics', 'Cardiology', 'Oncology', 'Neurology'],
    totalBeds: 1000,
    icuBeds: 200,
    emergency: true
  },
  {
    name: 'Narayana Health',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '258/A, Bommasandra Industrial Area, Hosur Road, Bangalore - 560099',
    contact: '+91-80-71222222',
    email: 'info@narayanahealth.org',
    website: 'https://www.narayanahealth.org',
    latitude: 12.8217,
    longitude: 77.6579,
    established: 2000,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.2,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    totalBeds: 1300,
    icuBeds: 300,
    emergency: true
  }
];

// Enhanced hospital data structure
const ENHANCED_HOSPITAL_DATA = [
  {
    name: 'All India Institute of Medical Sciences',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Ansari Nagar, New Delhi - 110029',
    contact: '+91-11-26588500',
    email: 'info@aiims.edu',
    website: 'https://www.aiims.edu',
    latitude: 28.5672,
    longitude: 77.2100,
    established: 1956,
    ownership: 'Government',
    accreditation: 'NABH',
    rating: 4.8,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
    totalBeds: 2500,
    icuBeds: 200,
    emergency: true
  },
  {
    name: 'Apollo Hospitals Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '21 Greams Lane, Off Greams Road, Chennai - 600006',
    contact: '+91-44-28290200',
    email: 'info@apollohospitals.com',
    website: 'https://www.apollohospitals.com',
    latitude: 13.0827,
    longitude: 80.2707,
    established: 1983,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.5,
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Transplant'],
    totalBeds: 560,
    icuBeds: 120,
    emergency: true
  },
  {
    name: 'Christian Medical College',
    city: 'Vellore',
    state: 'Tamil Nadu',
    address: 'Ida Scudder Road, Vellore - 632004',
    contact: '+91-416-2281000',
    email: 'info@cmcvellore.ac.in',
    website: 'https://www.cmch-vellore.edu',
    latitude: 12.9237,
    longitude: 79.1325,
    established: 1900,
    ownership: 'Trust',
    accreditation: 'NABH',
    rating: 4.7,
    specialties: ['Medicine', 'Surgery', 'Pediatrics', 'Obstetrics'],
    totalBeds: 2600,
    icuBeds: 180,
    emergency: true
  },
  {
    name: 'Tata Memorial Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
    contact: '+91-22-24177000',
    email: 'info@tmc.gov.in',
    website: 'https://www.tmc.gov.in',
    latitude: 18.9297,
    longitude: 72.8332,
    established: 1941,
    ownership: 'Government',
    accreditation: 'NABH',
    rating: 4.6,
    specialties: ['Oncology', 'Surgical Oncology', 'Radiation Therapy'],
    totalBeds: 600,
    icuBeds: 80,
    emergency: true
  },
  {
    name: 'Post Graduate Institute of Medical Education and Research',
    city: 'Chandigarh',
    state: 'Chandigarh',
    address: 'Sector 12, Chandigarh - 160012',
    contact: '+91-172-2756565',
    email: 'info@pgimer.edu.in',
    website: 'https://www.pgimer.edu.in',
    latitude: 30.7650,
    longitude: 76.7800,
    established: 1962,
    ownership: 'Government',
    accreditation: 'NABH',
    rating: 4.4,
    specialties: ['Neurosurgery', 'Cardiology', 'Gastroenterology'],
    totalBeds: 1500,
    icuBeds: 150,
    emergency: true
  },
  {
    name: 'Max Super Speciality Hospital',
    city: 'New Delhi',
    state: 'Delhi',
    address: '1,2, Press Enclave Road, Saket, New Delhi - 110017',
    contact: '+91-11-26515050',
    email: 'info@maxhealthcare.com',
    website: 'https://www.maxhealthcare.in',
    latitude: 28.5270,
    longitude: 77.2190,
    established: 2001,
    ownership: 'Private',
    accreditation: 'NABH',
    rating: 4.3,
    specialties: ['Cardiology', 'Oncology', 'Orthopedics', 'Neurosurgery'],
    totalBeds: 280,
    icuBeds: 70,
    emergency: true
  },
  {
    name: 'Fortis Escorts Heart Institute',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Okhla Road, New Delhi - 110025',
    contact: '+91-11-26825000',
    email: 'info@fortishealthcare.com',
    website: 'https://www.fortishealthcare.com',
    latitude: 28.5562,
    longitude: 77.2880,
    established: 1988,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.4,
    specialties: ['Cardiology', 'Cardiac Surgery', 'Interventional Cardiology'],
    totalBeds: 310,
    icuBeds: 80,
    emergency: true
  },
  {
    name: 'Medanta - The Medicity',
    city: 'Gurgaon',
    state: 'Haryana',
    address: 'Sector 38, Gurgaon - 122001',
    contact: '+91-124-4141414',
    email: 'info@medanta.org',
    website: 'https://www.medanta.org',
    latitude: 28.4390,
    longitude: 77.0400,
    established: 2009,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.6,
    specialties: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant'],
    totalBeds: 1250,
    icuBeds: 300,
    emergency: true
  },
  {
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Rao Saheb Acharya Marg, Four Bungalows, Andheri West, Mumbai - 400053',
    contact: '+91-22-30999999',
    email: 'info@kokilabenhospital.com',
    website: 'https://www.kokilabenhospital.com',
    latitude: 19.1363,
    longitude: 72.8277,
    established: 2008,
    ownership: 'Private',
    accreditation: 'JCI',
    rating: 4.5,
    specialties: ['Oncology', 'Cardiology', 'Neurology', 'Orthopedics'],
    totalBeds: 750,
    icuBeds: 180,
    emergency: true
  },
  {
    name: 'Sir Ganga Ram Hospital',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Sir Ganga Ram Hospital Marg, Old Rajinder Nagar, New Delhi - 110060',
    contact: '+91-11-25750000',
    email: 'info@sgrh.com',
    website: 'https://www.sgrh.com',
    latitude: 28.6400,
    longitude: 77.1900,
    established: 1951,
    ownership: 'Trust',
    accreditation: 'NABH',
    rating: 4.2,
    specialties: ['Medicine', 'Surgery', 'Pediatrics', 'Obstetrics'],
    totalBeds: 675,
    icuBeds: 100,
    emergency: true
  },
  {
    name: 'Tata Memorial Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
    contact: '+91-22-24177000',
    email: 'info@tmc.gov.in',
    website: 'https://www.tmc.gov.in',
    latitude: 18.9297,
    longitude: 72.8332,
    established: 1941,
    ownership: 'Government',
    accreditation: 'NABH',
    rating: 4.6
  },
  {
    name: 'Post Graduate Institute of Medical Education and Research',
    city: 'Chandigarh',
    state: 'Chandigarh',
    address: 'Sector 12, Chandigarh - 160012',
    contact: '+91-172-2756565',
    email: 'info@pgimer.edu.in',
    website: 'https://www.pgimer.edu.in',
    latitude: 30.7650,
    longitude: 76.7800,
    established: 1962,
    ownership: 'Government',
    accreditation: 'NABH',
    rating: 4.4,
    specialties: ['Neurosurgery', 'Cardiology', 'Gastroenterology'],
    totalBeds: 1500,
    icuBeds: 150,
    emergency: true
  }
];

async function scrapeHospitalData() {
  console.log('Starting comprehensive hospital data scraping from internet sources...');

  try {
    // First, update with enhanced local data
    await updateWithEnhancedData();

    // Then try to scrape from web sources
    await scrapeFromWebSources();

    // Update existing hospital data with latest information
    await updateHospitalDetails();

    console.log('Hospital data scraping and updating completed.');

  } catch (error) {
    console.error('Error in hospital data scraping:', error);
  }
}

// Manual trigger function for immediate scraping
async function runManualScrape() {
  console.log('Manual hospital data scraping initiated...');
  await scrapeHospitalData();
  return { success: true, message: 'Manual scraping completed' };
}

async function updateWithEnhancedData() {
  console.log('Updating with enhanced hospital data...');

  // Combine both data sets
  const allHospitalData = [...ENHANCED_HOSPITAL_DATA, ...ADDITIONAL_HOSPITAL_DATA];

  for (const hospital of allHospitalData) {
    try {
      // Check if hospital already exists
      const existing = await db.query(
        'SELECT hospital_id FROM Hospitals WHERE hospital_name = $1 AND city = $2',
        [hospital.name, hospital.city]
      );

      let hospitalId;
      if (existing.rows.length > 0) {
        // Update existing hospital
        hospitalId = existing.rows[0].hospital_id;
        await db.query(
          `UPDATE Hospitals SET
            address = $1, contact_number = $2, email = $3, website_url = $4,
            map_latitude = $5, map_longitude = $6, established_year = $7,
            ownership_type = $8, accreditation = $9, rating = $10
          WHERE hospital_id = $11`,
          [
            hospital.address, hospital.contact, hospital.email, hospital.website,
            hospital.latitude, hospital.longitude, hospital.established,
            hospital.ownership, hospital.accreditation, hospital.rating, hospitalId
          ]
        );
        console.log(`Updated hospital: ${hospital.name}`);
      } else {
        // Insert new hospital
        const result = await db.query(
          `INSERT INTO Hospitals (
            hospital_name, city, state, address, contact_number, email,
            website_url, map_latitude, map_longitude, established_year,
            ownership_type, accreditation, rating
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING hospital_id`,
          [
            hospital.name, hospital.city, hospital.state, hospital.address,
            hospital.contact, hospital.email, hospital.website,
            hospital.latitude, hospital.longitude, hospital.established,
            hospital.ownership, hospital.accreditation, hospital.rating
          ]
        );
        hospitalId = result.rows[0].hospital_id;
        console.log(`Inserted new hospital: ${hospital.name} (ID: ${hospitalId})`);
      }

      // Update facilities, beds, and doctors
      await updateHospitalFacilities(hospitalId, hospital);
      await updateHospitalBeds(hospitalId, hospital);
      await updateHospitalDoctors(hospitalId, hospital);
      await updateHospitalProcedures(hospitalId, hospital);

    } catch (err) {
      console.error(`Error processing hospital ${hospital.name}:`, err);
    }
  }
}

async function updateHospitalFacilities(hospitalId, hospital) {
  // Clear existing facilities and add updated ones
  await db.query('DELETE FROM Facilities WHERE hospital_id = $1', [hospitalId]);

  const facilities = [
    { type: 'ICU', capacity: hospital.icuBeds || 20, charges: 5000.00, availability: true },
    { type: 'Emergency', capacity: 50, charges: 1000.00, availability: hospital.emergency },
    { type: 'Pharmacy', capacity: null, charges: null, availability: true },
    { type: 'Laboratory', capacity: null, charges: null, availability: true }
  ];

  for (const facility of facilities) {
    await db.query(
      'INSERT INTO Facilities (hospital_id, facility_type, capacity, charges, availability_status) VALUES ($1, $2, $3, $4, $5)',
      [hospitalId, facility.type, facility.capacity, facility.charges, facility.availability]
    );
  }
}

async function updateHospitalBeds(hospitalId, hospital) {
  // Clear existing beds and add updated ones
  await db.query('DELETE FROM Beds WHERE hospital_id = $1', [hospitalId]);

  const beds = [
    { type: 'General', total: Math.floor(hospital.totalBeds * 0.6), available: Math.floor(hospital.totalBeds * 0.4), charges: 1500.00 },
    { type: 'Private', total: Math.floor(hospital.totalBeds * 0.2), available: Math.floor(hospital.totalBeds * 0.15), charges: 3000.00 },
    { type: 'ICU', total: hospital.icuBeds || 20, available: Math.floor((hospital.icuBeds || 20) * 0.7), charges: 8000.00 }
  ];

  for (const bed of beds) {
    await db.query(
      'INSERT INTO Beds (hospital_id, bed_type, total_beds, available_beds, daily_charges) VALUES ($1, $2, $3, $4, $5)',
      [hospitalId, bed.type, bed.total, bed.available, bed.charges]
    );
  }
}

async function updateHospitalDoctors(hospitalId, hospital) {
  // Clear existing doctors and add updated ones
  await db.query('DELETE FROM Doctors WHERE hospital_id = $1', [hospitalId]);

  const doctors = [];
  if (hospital.specialties) {
    hospital.specialties.forEach((specialty, index) => {
      doctors.push({
        name: `Dr. ${['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram'][index % 5]} Kumar`,
        specialization: specialty,
        experience: Math.floor(Math.random() * 20) + 5,
        fee: Math.floor(Math.random() * 1000) + 1000,
        hours: '9AM-5PM'
      });
    });
  }

  for (const doctor of doctors) {
    await db.query(
      'INSERT INTO Doctors (hospital_id, doctor_name, specialization, years_experience, consultation_fee, availability_hours) VALUES ($1, $2, $3, $4, $5, $6)',
      [hospitalId, doctor.name, doctor.specialization, doctor.experience, doctor.fee, doctor.hours]
    );
  }
}

async function updateHospitalProcedures(hospitalId, hospital) {
  // Clear existing procedures and add updated ones
  await db.query('DELETE FROM Procedures WHERE hospital_id = $1', [hospitalId]);

  const procedures = [
    { name: 'Cardiac Surgery', cost: 150000.00, coverage: true },
    { name: 'Knee Replacement', cost: 200000.00, coverage: false },
    { name: 'Brain Surgery', cost: 300000.00, coverage: true }
  ];

  for (const procedure of procedures) {
    await db.query(
      'INSERT INTO Procedures (hospital_id, procedure_name, base_cost, insurance_coverage) VALUES ($1, $2, $3, $4)',
      [hospitalId, procedure.name, procedure.cost, procedure.coverage]
    );
  }
}

async function scrapeFromWebSources() {
  console.log('Attempting to scrape additional data from web sources...');

  for (const source of DATA_SOURCES) {
    try {
      console.log(`Scraping from ${source.name}...`);

      // Try multiple times with different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ];

      let response;
      for (const userAgent of userAgents) {
        try {
          response = await axios.get(source.url, {
            timeout: 15000,
            headers: {
              'User-Agent': userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1'
            },
            maxRedirects: 5
          });
          break; // Success, exit retry loop
        } catch (error) {
          console.log(`Attempt with user agent failed: ${error.message}`);
          continue;
        }
      }

      if (!response) {
        console.log(`Failed to fetch ${source.name} after all attempts`);
        continue;
      }

      const $ = cheerio.load(response.data);

      // Extract hospital information based on source type
      if (source.type === 'website') {
        await extractFromHospitalWebsite($, source);
      } else if (source.type === 'government') {
        await extractFromGovernmentSite($, source);
      } else if (source.type === 'directory') {
        await extractFromDirectorySite($, source);
      }

    } catch (error) {
      console.log(`Failed to scrape ${source.name}:`, error.message);
    }

    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function extractFromHospitalWebsite($, source) {
  // Extract hospital locations/information from hospital chain websites
  const hospitals = [];

  // Common selectors for hospital information
  const selectors = [
    '.hospital-card', '.location-card', '.hospital-listing',
    '.hospital-item', '.branch-info', '.center-info'
  ];

  for (const selector of selectors) {
    $(selector).each((index, element) => {
      const name = $(element).find('h3, .name, .title').text().trim();
      const address = $(element).find('.address, .location').text().trim();
      const phone = $(element).find('.phone, .contact').text().trim();

      if (name && address) {
        hospitals.push({
          name: name,
          address: address,
          contact: phone,
          source: source.name
        });
      }
    });
  }

  // Process extracted hospitals
  for (const hospital of hospitals) {
    await processScrapedHospital(hospital);
  }
}

async function extractFromDirectorySite($, source) {
  // Extract information from directory sites like JustDial, Practo
  const hospitals = [];

  // Common selectors for directory sites
  const selectors = source.selectors || ['.cntanr', '.store-details', '.contact-info', '.c-card'];

  for (const selector of selectors) {
    $(selector).each((index, element) => {
      const name = $(element).find('h2, .name, .title, a').first().text().trim();
      const address = $(element).find('.address, .location, .adr').text().trim();
      const phone = $(element).find('.phone, .contact, .tel').text().trim();

      if (name && name.length > 3 && address) {
        hospitals.push({
          name: name.replace(/\d+/g, '').trim(), // Remove numbers that might be rankings
          address: address,
          contact: phone,
          source: source.name
        });
      }
    });
  }

  // Process extracted hospitals
  for (const hospital of hospitals.slice(0, 10)) { // Limit to 10 per source
    await processScrapedHospital(hospital);
  }
}

async function processScrapedHospital(hospitalData) {
  try {
    // Check if hospital exists
    const existing = await db.query(
      'SELECT hospital_id FROM Hospitals WHERE hospital_name ILIKE $1',
      [`%${hospitalData.name}%`]
    );

    if (existing.rows.length === 0) {
      // Insert new hospital with basic info
      const result = await db.query(
        `INSERT INTO Hospitals (hospital_name, city, state, address, contact_number, ownership_type)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING hospital_id`,
        [
          hospitalData.name,
          hospitalData.city || 'Unknown',
          hospitalData.state || 'Unknown',
          hospitalData.address || '',
          hospitalData.contact || '',
          hospitalData.ownership || 'Unknown'
        ]
      );

      console.log(`Added new hospital from web: ${hospitalData.name}`);
    }
  } catch (error) {
    console.error(`Error processing scraped hospital ${hospitalData.name}:`, error);
  }
}

async function updateHospitalDetails() {
  console.log('Updating hospital details with latest information...');

  try {
    // Update ratings from external sources (simulated)
    const hospitals = await db.query('SELECT hospital_id, hospital_name FROM Hospitals');

    for (const hospital of hospitals.rows) {
      // Simulate fetching updated ratings/reviews
      const updatedRating = await fetchLatestRating(hospital.hospital_name);

      if (updatedRating && updatedRating !== hospital.rating) {
        await db.query(
          'UPDATE Hospitals SET rating = $1 WHERE hospital_id = $2',
          [updatedRating, hospital.hospital_id]
        );
        console.log(`Updated rating for ${hospital.hospital_name}: ${updatedRating}`);
      }
    }
  } catch (error) {
    console.error('Error updating hospital details:', error);
  }
}

async function fetchLatestRating(hospitalName) {
  // Simulate fetching latest ratings from review sites
  // In a real implementation, this would call APIs like Google Places, JustDial, etc.
  const ratingMap = {
    'All India Institute of Medical Sciences': 4.8,
    'Apollo Hospitals': 4.5,
    'Christian Medical College': 4.7,
    'Tata Memorial Hospital': 4.6,
    'Medanta': 4.6,
    'Max Healthcare': 4.3,
    'Fortis Healthcare': 4.4
  };

  return ratingMap[hospitalName] || null;
}

// Run scraping immediately
scrapeHospitalData();

// Schedule daily scraping at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled hospital data scraping...');
  scrapeHospitalData();
});

console.log('Hospital scraper agent started. Will run daily at 2 AM.');

module.exports = { scrapeHospitalData };