// api.js — All fetch logic for ShopWave
// Handles product fetching from fakestoreapi.com with error handling

const API_URL = 'https://fakestoreapi.com/products';

/**
 * Fetch all products from the Fake Store API.
 * Returns an array of product objects or throws an Error.
 */
const fetchProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error — status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

/**
 * Extract unique category names from a products array.
 * Uses Set to deduplicate, then spreads back to array.
 */
const extractCategories = (products) => {
  const categorySet = new Set(products.map((product) => product.category));
  return [...categorySet];
};
