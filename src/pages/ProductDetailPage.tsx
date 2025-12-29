import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, AlertCircle, Star, Upload, X } from 'lucide-react';
import { doc, getDoc, collection, addDoc, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product, Review } from '../types';
import Toast from '../components/Toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    images: [] as File[],
    userName: user?.displayName || ''
  });
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get price info for selected size
  const getCurrentPriceInfo = () => {
    if (!product) return { price: 0, discount: 0, finalPrice: 0, stock: 0 };
    
    if (product.priceVariants && product.priceVariants.length > 0) {
      const variant = product.priceVariants.find(v => v.size === selectedSize);
      if (variant) {
        const discount = variant.discount || product.discount || 0;
        const finalPrice = discount > 0 ? (variant.price * (100 - discount)) / 100 : variant.price;
        return {
          price: variant.price || 0,
          discount: discount || 0,
          finalPrice: finalPrice || 0,
          stock: variant.stock || 0
        };
      }
    }
    
    const price = product.price || 0;
    const discount = product.discount || 0;
    const discountedPrice = product.discountedPrice || (discount > 0 ? (price * (100 - discount)) / 100 : price);
    
    return {
      price: price,
      discount: discount,
      finalPrice: discountedPrice,
      stock: product.stockQuantity || 0
    };
  };

  const fetchReviews = async () => {
    if (!id) {
      console.error('No product ID available for fetching reviews');
      return;
    }

    try {
      console.log('Starting to fetch reviews for product:', id);
      
      // Create a query to get reviews for this product
      const reviewsRef = collection(db, 'reviews');
      let querySnapshot;
      
      try {
        // First try with ordering
        const q = query(
          reviewsRef,
          where('productId', '==', id),
          orderBy('createdAt', 'desc')
        );
        querySnapshot = await getDocs(q);
      } catch (error: any) {
        console.warn('Error with ordered query:', error);
        
        // Check if it's a permissions error
        if (error.code === 'permission-denied') {
          console.warn('Permission denied for reviews. Please check Firestore rules.');
          setError('Unable to load reviews due to permission issues. Please contact support.');
          return;
        }
        
        // Fallback to basic query without ordering
        console.warn('Falling back to basic query without ordering');
        const basicQuery = query(
          reviewsRef,
          where('productId', '==', id)
        );
        querySnapshot = await getDocs(basicQuery);
      }

      console.log('Query completed. Found reviews:', querySnapshot.size);

      if (querySnapshot.empty) {
        console.log('No reviews found for this product');
        setReviews([]);
        return;
      }

      // Process the reviews with better error handling
      const reviewsList = querySnapshot.docs
        .map(doc => {
          try {
            const data = doc.data();
            console.log('Processing review:', doc.id, data);
            
            // Ensure createdAt is a valid date
            let createdAt = new Date();
            if (data.createdAt) {
              if (data.createdAt instanceof Date) {
                createdAt = data.createdAt;
              } else if (data.createdAt.toDate) {
                createdAt = data.createdAt.toDate();
              } else {
                createdAt = new Date(data.createdAt);
              }
            }

            return {
              id: doc.id,
              productId: data.productId,
              userId: data.userId,
              userName: data.userName || 'Anonymous',
              rating: data.rating || 0,
              comment: data.comment || '',
              images: data.images || [],
              createdAt: createdAt
            };
          } catch (error) {
            console.error('Error processing review:', doc.id, error);
            return null;
          }
        })
        .filter((review): review is Review => review !== null)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort in memory as fallback

      console.log('Successfully processed reviews:', reviewsList);
      setReviews(reviewsList);
    } catch (error: any) {
      console.error('Detailed error fetching reviews:', error);
      
      // Provide more specific error messages based on the error type
      if (error.code === 'permission-denied') {
        setError('Unable to load reviews due to permission issues. Please contact support.');
      } else if (error.code === 'not-found') {
        setError('Reviews collection not found. Please contact support.');
      } else {
        setError('Failed to load reviews. Please try again later.');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('Product ID is missing');
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Starting to load product with ID:', id);
        
        // Fetch product with retry logic
        const productRef = doc(db, 'products', id);
        console.log('Product reference created:', productRef.path);
        
        let retryCount = 0;
        const maxRetries = 3;
        let productDoc;

        while (retryCount < maxRetries) {
          try {
            productDoc = await getDoc(productRef);
            if (productDoc.exists()) break; // Only break if document exists
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error('Product not found after multiple retries');
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        if (!productDoc) {
          throw new Error('Failed to fetch product after multiple retries');
        }

        console.log('Product document fetched:', productDoc.exists() ? 'exists' : 'does not exist');
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          console.log('Raw product data:', productData);
          
          const formattedProduct: Product = {
            id: productDoc.id,
            name: productData.name || '',
            description: productData.description || '',
            shortDescription: productData.shortDescription || '',
            sizes: productData.sizes || [],
            imageUrl: productData.imageUrl || '',
            images: productData.images || [],
            category: productData.category || '',
            price: productData.price || 0,
            discount: productData.discount || 0,
            discountedPrice: productData.discount > 0 
              ? (productData.price * (100 - productData.discount)) / 100 
              : productData.price,
            stockQuantity: productData.stockQuantity || 0,
            priceVariants: productData.priceVariants || [],
            customChemicals: productData.customChemicals || [],
            nutrients: {
              nitrogen: productData.nitrogen || 0,
              phosphorus: productData.phosphorus || 0,
              potassium: productData.potassium || 0,
              otherNutrients: productData.otherNutrients || {}
            },
            applicationMethod: productData.applicationMethod || '',
            benefits: productData.benefits || [],
            stockAvailability: productData.stockAvailability || productData.stockQuantity > 0
          };
          
          console.log('Formatted product data:', formattedProduct);
          setProduct(formattedProduct as Product);
          
          // Auto-select smallest size
          if (formattedProduct.priceVariants && formattedProduct.priceVariants.length > 0) {
            setSelectedSize(formattedProduct.priceVariants[0].size);
          } else if (formattedProduct.sizes && formattedProduct.sizes.length > 0) {
            setSelectedSize(formattedProduct.sizes[0]);
          }
          
          // Fetch reviews after product is loaded
          console.log('Product loaded successfully, fetching reviews...');
          await fetchReviews();
        } else {
          console.error('No product found with ID:', id);
          setError('Product not found. Please check the URL and try again.');
        }
      } catch (error) {
        console.error('Detailed error loading product:', error);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    // Update userName when user changes
    if (user?.displayName) {
      setNewReview(prev => ({
        ...prev,
        userName: user.displayName || 'Anonymous'
      }));
    }
  }, [user]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      setToastMessage('Please select a size');
      setShowToast(true);
      return;
    }
    
    const priceInfo = getCurrentPriceInfo();
    
    addItem({
      id: product.id,
      name: product.name,
      quantity,
      size: selectedSize,
      price: priceInfo.finalPrice,
      image: product.imageUrl,
      nutrients: product.nutrients || undefined
    });
    setShowToast(true);
    setToastMessage(`${product.name} added to cart`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowToast(true);
      setToastMessage('Please login to submit a review');
      return;
    }

    if (!product) {
      setShowToast(true);
      setToastMessage('Product information is missing');
      return;
    }

    if (!newReview.comment.trim()) {
      setShowToast(true);
      setToastMessage('Please enter your review comment');
      return;
    }

    setUploading(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (newReview.images.length > 0) {
        imageUrls = await Promise.all(
          newReview.images.map(async (file) => {
            const storageRef = ref(storage, `reviews/${product.id}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            return getDownloadURL(snapshot.ref);
          })
        );
      }

      // Create review document with all required fields
      const reviewData = {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        images: imageUrls,
        createdAt: new Date()
      };

      // Add the review to Firestore
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log('Review added with ID:', docRef.id);

      // Reset form
      setNewReview({
        rating: 5,
        comment: '',
        images: [],
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous'
      });

      // Show success message
      setShowToast(true);
      setToastMessage('Review submitted successfully!');

      // Refresh reviews
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      setShowToast(true);
      setToastMessage('Failed to submit review. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setShowToast(true);
      setToastMessage('Review deleted successfully!');
    } catch (error) {
      setShowToast(true);
      setToastMessage('Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Error Loading Product</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-y-4">
              <Link to="/products" className="btn btn-primary block">
                Browse Products
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-secondary block"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Price Display Component
  const PriceDisplay = () => {
    try {
      const priceInfo = getCurrentPriceInfo();
      
      return (
        <div className="mb-6">
          {priceInfo.discount > 0 ? (
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">
                ₹{priceInfo.finalPrice.toFixed(2)}
              </span>
              <span className="text-xl text-gray-400 line-through">
                ₹{priceInfo.price.toFixed(2)}
              </span>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                Save {priceInfo.discount}%
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-green-600">
              ₹{priceInfo.finalPrice.toFixed(2)}
            </span>
          )}
          
          {/* Stock Info */}
          {priceInfo.stock > 0 ? (
            <p className="text-sm text-gray-600 mt-2">
              {priceInfo.stock} units in stock
            </p>
          ) : (
            <p className="text-sm text-red-600 mt-2">
              Out of stock
            </p>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error in PriceDisplay:', error);
      return (
        <div className="mb-6">
          <span className="text-3xl font-bold text-green-600">
            ₹{product?.price?.toFixed(2) || '0.00'}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-600 transition">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-primary-600 transition">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="animate-fade-in">
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg mb-4">
              <img
                src={product.images?.[selectedImageIndex]?.url || product.imageUrl}
                alt={product.images?.[selectedImageIndex]?.alt || product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-accent-500 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </div>
              {(product.discount || 0) > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  {product.discount}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIndex === index 
                        ? 'border-green-500 ring-2 ring-green-200' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {image.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs py-0.5 text-center">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Size Selector */}
            {((product.priceVariants && product.priceVariants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Package Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {product.priceVariants && product.priceVariants.length > 0 ? (
                    product.priceVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(variant.size)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedSize === variant.size
                            ? 'border-primary-600 bg-primary-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            selectedSize === variant.size ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            {variant.size}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ₹{variant.price?.toFixed(2) || '0.00'}
                          </div>
                          {variant.stock !== undefined && (
                            <div className={`text-xs mt-1 ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                            </div>
                          )}
                        </div>
                        {selectedSize === variant.size && (
                          <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    product.sizes?.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-primary-600 bg-primary-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            selectedSize === size ? 'text-primary-700' : 'text-gray-900'
                          }`}>
                            {size}
                          </div>
                        </div>
                        {selectedSize === size && (
                          <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Price Section */}
            <PriceDisplay />
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            {/* Nutrient Content - Only show if there are actual values or custom chemicals */}
            {((product.nutrients?.nitrogen > 0 || product.nutrients?.phosphorus > 0 || product.nutrients?.potassium > 0) ||
              (product.nutrients?.otherNutrients && Object.keys(product.nutrients.otherNutrients).length > 0) ||
              (product.customChemicals && product.customChemicals.length > 0)) && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Nutrient Content</h3>
                
                {/* NPK Values - Only show if at least one is greater than 0 */}
                {(product.nutrients?.nitrogen > 0 || product.nutrients?.phosphorus > 0 || product.nutrients?.potassium > 0) && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-blue-500 font-bold text-2xl mb-1">{product.nutrients.nitrogen}%</div>
                      <div className="text-gray-600 text-sm">Nitrogen (N)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-500 font-bold text-2xl mb-1">{product.nutrients.phosphorus}%</div>
                      <div className="text-gray-600 text-sm">Phosphorus (P)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-500 font-bold text-2xl mb-1">{product.nutrients.potassium}%</div>
                      <div className="text-gray-600 text-sm">Potassium (K)</div>
                    </div>
                  </div>
                )}
                
                {product.nutrients?.otherNutrients && Object.keys(product.nutrients.otherNutrients).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium mb-2">Micronutrients:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(product.nutrients.otherNutrients).map(([name, value]) => (
                        <div key={name} className="text-sm">
                          <span className="font-medium">{name.charAt(0).toUpperCase() + name.slice(1)}:</span> {value}%
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.customChemicals && product.customChemicals.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium mb-3">Additional Chemicals:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {product.customChemicals.map((chemical, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="font-semibold text-gray-900">{chemical.name}</div>
                          <div className="text-lg text-blue-600 font-bold">{chemical.percentage}{chemical.unit || '%'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span className="ml-2 text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Application Method */}
            {product.applicationMethod && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Application Method</h3>
                <p className="text-gray-700">{product.applicationMethod}</p>
              </div>
            )}
            
            {/* Add to Cart */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-12 text-center border-0 focus:outline-none text-gray-900"
                  aria-label="Quantity"
                />
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="btn btn-primary flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          
          {/* Review Form - Only show for logged in users */}
          {user ? (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Optional)</label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex space-x-2">
                      {newReview.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary w-full"
                >
                  {uploading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
              <p className="text-gray-600 mb-4">Please login to write a review</p>
              <Link to="/login" className="btn btn-primary">
                Login to Review
              </Link>
            </div>
          )}
          
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{review.userName || 'Anonymous'}</h4>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.createdAt instanceof Date 
                        ? review.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                      }
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center mt-2">
                    {(user && (review.userId === user.uid || userRole === 'admin')) && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="ml-auto px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;