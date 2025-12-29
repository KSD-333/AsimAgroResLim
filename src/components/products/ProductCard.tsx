import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Info } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import Toast from '../Toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Auto-select the smallest size on mount
  const getSmallestSize = () => {
    if (product.priceVariants && product.priceVariants.length > 0) {
      return product.priceVariants[0].size;
    }
    return product.sizes?.[0] || '';
  };

  const [selectedSize, setSelectedSize] = useState(getSmallestSize());
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCart();

  // Get price for selected size
  const getCurrentPrice = () => {
    if (product.priceVariants && product.priceVariants.length > 0) {
      const variant = product.priceVariants.find(v => v.size === selectedSize);
      if (variant) {
        const price = variant.price || 0;
        const discount = variant.discount || product.discount || 0;
        const finalPrice = discount > 0 ? (price * (100 - discount)) / 100 : price;
        return { price, discount, finalPrice };
      }
    }
    const price = product.price || 0;
    const discount = product.discount || 0;
    const discountedPrice = product.discountedPrice || (discount > 0 ? (price * (100 - discount)) / 100 : price);
    return {
      price: price,
      discount: discount,
      finalPrice: discountedPrice
    };
  };

  const priceInfo = getCurrentPrice();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      quantity: 1,
      size: selectedSize,
      price: priceInfo.finalPrice,
      image: product.imageUrl,
      nutrients: product.nutrients
    });
    setShowToast(true);
  };

  return (
    <>
      <div className="card h-full flex flex-col group">
        <div className="relative overflow-hidden">
          <img
            src={product.images?.[0]?.url || product.imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4 bg-accent-500 text-secondary-800 text-xs font-bold px-2 py-1 rounded">
            {product.category}
          </div>
          {product.discount > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
              {product.discount}% OFF
            </div>
          )}
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-primary-900">{product.name}</h3>
          <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{product.description}</p>
          
          {/* Price Display */}
          <div className="mb-4">
            {priceInfo.discount > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  ₹{priceInfo.finalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{priceInfo.price.toFixed(2)}
                </span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {priceInfo.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-green-600">
                ₹{priceInfo.finalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NPK Ratio</span>
              {product.nutrients && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-600">
                    N: {product.nutrients.nitrogen}%
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    P: {product.nutrients.phosphorus}%
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    K: {product.nutrients.potassium}%
                  </span>
                </div>
              )}
            </div>
            {product.nutrients && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center">
                  <span className="w-8 text-xs text-blue-600">N</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${product.nutrients.nitrogen}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-600">{product.nutrients.nitrogen}%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-xs text-green-600">P</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${product.nutrients.phosphorus}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-600">{product.nutrients.phosphorus}%</span>
                </div>
                <div className="flex items-center">
                  <span className="w-8 text-xs text-orange-600">K</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{ width: `${product.nutrients.potassium}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-gray-600">{product.nutrients.potassium}%</span>
                </div>
              </div>
            )}
          </div>
          
          <select 
            className="form-select bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 w-full"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            {product.priceVariants && product.priceVariants.length > 0 ? (
              product.priceVariants.map((variant, index) => (
                <option key={index} value={variant.size}>
                  {variant.size} - ₹{variant.discount > 0 ? ((variant.price * (100 - variant.discount)) / 100).toFixed(2) : variant.price.toFixed(2)}
                </option>
              ))
            ) : (
              product.sizes?.map((size, index) => (
                <option key={index} value={size}>{size}</option>
              ))
            )}
          </select>
          <div className="flex space-x-2">
            <Link 
              to={`/products/${product.id}`}
              className="btn bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-2"
              aria-label={`View details of ${product.name}`}
            >
              <Info className="h-5 w-5" />
            </Link>
            <button
              className="btn btn-primary px-3 py-2"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={`${product.name} added to cart`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ProductCard;