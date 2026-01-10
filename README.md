# Asim Agro 🌾

Asim Agro is a modern e-commerce web application built with **React** and **Vite**, designed specifically for agricultural products. It provides seamless experiences for both users and admins with real-time functionalities powered by **Firebase**.

## 🔥 Features

### 🛒 User Features
- Browse and search agricultural products
- Add products to cart and checkout
- Track order status
- Share Feedback On Products
- User registration and login
- Secure authentication using Firebase Auth

### 🛠️ Admin Features
- Add, edit, or delete products
- Manage orders placed by users
- Monitor User and Products sale
- Admin authentication and protected routes
- Delete Users Update Delivery Status

### 🌐 Technologies Used
- **Frontend**: React 18.3 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express.js + Firebase Admin SDK
- **Database**: Firebase Firestore (Cloud NoSQL)
- **Authentication**: Firebase Authentication
- **Storage**: Cloudinary (images), Firestore (data)
- **Hosting**: Netlify/Vercel (frontend), separate backend hosting

### Security Features
- Secured Route
- Authentication using Firebase Auth
- Firebase Admin SDK for token verification
- Used env files to store Firebase credentials

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project (create one at [Firebase Console](https://console.firebase.google.com))
- Cloudinary account for image uploads

### 1. Clone the repository
```bash
git clone https://github.com/KSD-333/Asim--Agro-Res-Lim.git
cd Asim--Agro-Res-Lim
```

### 2. Frontend Setup

Create a `.env` file in the **root directory**:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_DATABASE_URL=your_database_url_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 3. Backend Setup

Create a `.env` file in the **server** directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Getting Firebase Admin Credentials:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract: `project_id`, `private_key`, and `client_email`

### 4. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

If you get an error during npm install, try:
```bash
npm install --legacy-peer-deps
```

### 5. Run the Application

**Development mode (runs both frontend + backend):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server:dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 6. Firebase Firestore Setup

Enable Firestore in your Firebase Console and set up the following collections:
- `users` - User profiles and roles
- `products` - Product catalog
- `orders` - Customer orders
- `carts` - Shopping carts
- `reviews` - Product reviews
- `contactForms` - Contact submissions
- `feedback` - User feedback
- `orderMessages` - Order-related messages

**Firestore Security Rules** (update in Firebase Console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null && (resource.data.firebaseUid == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Firebase Firestore Collections Structure

### Users Collection
```javascript
{
  firebaseUid: "string",
  email: "string",
  displayName: "string",
  role: "user|admin|dealer",
  isActive: boolean,
  shippingAddress: {
    name, address, city, state, pincode, phone
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Products Collection
```javascript
{
  name: "string",
  description: "string",
  shortDescription: "string",
  category: "string",
  images: [{url, alt, isPrimary}],
  price: number,
  discount: number,
  sizes: ["array"],
  priceVariants: [{size, price, discount, stock}],
  nutrients: {nitrogen, phosphorus, potassium},
  customChemicals: [{name, percentage, unit}],
  isActive: boolean,
  isFeatured: boolean,
  views: number,
  rating: {average, count},
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 📦 Build for Production

```bash
npm run build
```

This will:
1. Install server dependencies
2. Build the frontend for production

## 🚀 Deployment

### Frontend (Netlify/Vercel)
- Build command: `npm run build`
- Publish directory: `dist`
- Add all VITE_ environment variables

### Backend
- Deploy to any Node.js hosting (Heroku, Railway, Render, etc.)
- Set all Firebase Admin and Cloudinary environment variables
- Run: `npm start`

## 🌟 Your Agriculture E-Commerce Platform with Firebase is Ready!
