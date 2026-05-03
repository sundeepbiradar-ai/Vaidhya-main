const { Client } = require('@elastic/elasticsearch');
const { elasticsearch } = require('../config');

const client = new Client({ node: elasticsearch.node });
const indexName = elasticsearch.index;

const ensureIndex = async () => {
  const exists = await client.indices.exists({ index: indexName });
  if (!exists) {
    await client.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              autocomplete: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'autocomplete_filter']
              }
            },
            filter: {
              autocomplete_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20
              }
            }
          }
        },
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'autocomplete', search_analyzer: 'standard' },
            city: { type: 'keyword' },
            state: { type: 'keyword' },
            address: { type: 'text' },
            specializations: { type: 'keyword' },
            insurance_partners: { type: 'keyword' },
            emergency: { type: 'boolean' },
            rating: { type: 'float' },
            location: { type: 'geo_point' },
            sameAs: { type: 'keyword' }
          }
        }
      }
    });
  }
};

const indexHospitalRecord = async (hospital) => {
  await ensureIndex();
  const body = {
    id: hospital.id,
    name: hospital.name,
    city: hospital.city,
    state: hospital.state,
    address: hospital.address,
    specializations: hospital.specialties || [],
    insurance_partners: hospital.insurance_partners || [],
    emergency: hospital.emergency || false,
    rating: hospital.rating || 0,
    location: { lat: hospital.latitude, lon: hospital.longitude },
    sameAs: hospital.unique_key ? [hospital.unique_key] : []
  };
  return client.index({ index: indexName, id: hospital.id.toString(), body, refresh: true });
};

const searchHospitals = async ({ query, city, lat, lon, specialization, emergency, insurance, page = 1, limit = 20 }) => {
  await ensureIndex();
  const must = [];
  const should = [];

  if (query) {
    should.push({
      multi_match: {
        query,
        fields: ['name^3', 'address', 'city', 'state', 'specializations^2'],
        fuzziness: 'AUTO'
      }
    });
  }
  if (city) {
    must.push({ term: { city: city.toLowerCase() } });
  }
  if (specialization) {
    must.push({ term: { specializations: specialization.toLowerCase() } });
  }
  if (emergency) {
    must.push({ term: { emergency: true } });
  }
  if (insurance) {
    must.push({ term: { insurance_partners: insurance.toLowerCase() } });
  }

  const sort = lat && lon
    ? [{ _geo_distance: { location: { lat: parseFloat(lat), lon: parseFloat(lon) }, order: 'asc', unit: 'km' } }, { rating: 'desc' }]
    : [{ rating: 'desc' }];

  const res = await client.search({
    index: indexName,
    body: {
      query: {
        bool: {
          must,
          should,
          minimum_should_match: should.length ? 1 : 0
        }
      },
      sort,
      from: (page - 1) * limit,
      size: limit
    }
  });

  return {
    total: res.hits.total.value,
    hospitals: res.hits.hits.map((hit) => ({ id: hit._id, score: hit._score, ...hit._source }))
  };
};

const getAutoSuggestions = async (text) => {
  await ensureIndex();
  const result = await client.search({
    index: indexName,
    body: {
      suggest: {
        hospital_suggest: {
          prefix: text,
          completion: {
            field: 'name',
            fuzzy: { fuzziness: 'AUTO' },
            size: 8
          }
        }
      }
    }
  });
  return result.body.suggest?.hospital_suggest?.[0]?.options?.map((option) => option.text) || [];
};

const suggestByCity = async (city) => {
  await ensureIndex();
  const result = await client.search({
    index: indexName,
    body: {
      size: 0,
      query: { term: { city: city.toLowerCase() } },
      aggs: {
        top_hospitals: { top_hits: { size: 10, _source: ['name', 'rating'] } }
      }
    }
  });
  return result.body.aggregations.top_hospitals.hits.hits.map((hit) => hit._source);
};

module.exports = { indexHospitalRecord, searchHospitals, getAutoSuggestions, suggestByCity };
