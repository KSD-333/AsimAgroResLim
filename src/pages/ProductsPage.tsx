import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsList);
        setFilteredProducts(productsList);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(productsList.map(product => product.category)));
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Handle URL category filter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 animate-fade-in">
      {/* Header */}
      <div className="bg-primary-800 py-12">
        <div className="container-custom">
          <h1 className="text-white text-center">Our Products</h1>
          <p className="text-primary-100 text-center max-w-3xl mx-auto mt-4">
            Discover our range of premium fertilizers designed to enhance soil fertility, boost crop yield, and ensure sustainable agriculture.
          </p>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="section pt-8">
        <div className="container-custom">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              className="md:hidden btn btn-outline flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>

            {/* Desktop filters */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Filter by:</span>
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-4 py-2 rounded-md transition ${
                  !selectedCategory 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-md transition ${
                    selectedCategory === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="md:hidden bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`px-4 py-2 rounded-md text-sm transition ${
                      !selectedCategory 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-md text-sm transition ${
                        selectedCategory === category 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center text-primary-600 hover:text-primary-700 mt-4 text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Products grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;