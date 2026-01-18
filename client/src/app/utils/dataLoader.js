import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

export const getCacheKey = (url, params = {}) => {
  return `${url}:${JSON.stringify(params)}`
}

export const getCachedData = (key) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
};

export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export const productLoader = async ({ params }) => {
  const { product_id } = params;

  if (!product_id) {
    throw new Error('Product ID is required');
  }

  const cacheKey = getCacheKey(`product-${product_id}`);
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await api.get(`/products/${product_id}`, {
      signal: AbortSignal.timeout(5000),
    });

    const data = response.data;
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw new Error('Request was cancelled');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    if (error.response?.status === 404) {
      throw new Response('Product not found', { status: 404 });
    }

    throw error.response?.data || new Error('Failed to load product');
  }
};

export const homepageLoader = async () => {
  const cacheKey = getCacheKey('homepage')
  const cached = getCachedData(cacheKey)
  if (cached) {
    return cached
  };

  try {
    const [featured, deals, categories] = await Promise.all([
      api.get('/categories'),
    ]);

    const data = {
      featured: featured.data,
      deals: deals.data,
      categories: categories.data,
    };

    setCachedData(cacheKey, data)
    return data
  } catch (error) {
    return {
      featured: [],
      deals: [],
      categories: [],
      error: 'Failed to load homepage data',
    }
  };
};

export const searchLoader = async (query = '') => {
  const cacheKey = getCacheKey(`search-${query}`)
  const cached = getCachedData(cacheKey)
  if (cached) {
    return cached
  };

  try {
    const response = await api.get('/products/search', {
      params: { q: query },
    })

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    return {
      results: [],
      query,
      error: 'Search failed',
    }
  };
};