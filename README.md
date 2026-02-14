# Farmer Retail Backend 🌾

A secure REST API backend for farmers to sell their crops directly to customers with integrated image upload powered by Cloudinary.

## 🚀 Features

- **User Authentication** - JWT-based authentication with role-based access control
- **Product Management** - Full CRUD operations for agricultural products
- **Image Upload** - Direct Cloudinary integration with image optimization
- **Security Hardening** - Multiple layers of protection against common attacks
- **Comprehensive Logging** - Winston logger with structured logging and file rotation
- **Rate Limiting** - Protection against brute force and DDoS attacks

## 🛠️ Tech Stack

- **Node.js** + **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **Cloudinary** - Image hosting and optimization
- **Sharp** - Image processing
- **Winston** - Logging
- **Helmet** - Security headers
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

## 🔒 Security Features

### File Upload Security
- ✅ **Magic Number Validation** - Validates file signatures to prevent malicious files
- ✅ **MIME Type Checking** - Ensures only image files are accepted
- ✅ **File Size Limits** - 5MB per file, 25MB total per request
- ✅ **Automatic Cleanup** - Removes files after upload or on error

### Rate Limiting
- General API: 100 requests / 15 minutes
- Upload endpoints: 30 uploads / hour
- Authentication: 5 attempts / 15 minutes

### Additional Security
- CORS configuration with whitelist
- Content Security Policy (CSP)
- HSTS headers
- Input sanitization
- Role-based authorization

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Farmer-_Retail-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB=your_mongodb_connection_string

   # JWT Secrets
   JWTACCESS=your_jwt_access_secret
   JWTREFRESH=your_jwt_refresh_secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # CORS (comma-separated origins)
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/register` | Register new user | No |
| POST | `/api/v1/login` | Login user | No |
| POST | `/api/v1/logout` | Logout user | Yes |

### Products

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/api/v1/products` | Get all products | Yes | Any |
| GET | `/api/v1/products/:id` | Get product by ID | Yes | Any |
| POST | `/api/v1/products` | Create product with images | Yes | Farmer |
| PATCH | `/api/v1/products/:id` | Update product/images | Yes | Farmer |
| DELETE | `/api/v1/products/:id` | Delete product | Yes | Farmer |

### Product Schema

```javascript
{
  name: String (required, unique),
  price: Number (required),
  description: String (required),
  category: String (required),
  inStock: Boolean (default: true),
  StockQuantity: Number (default: 0),
  status: "processing" | "ready" | "failed",
  images: [
    {
      url: String,        // Cloudinary URL
      publicId: String    // Cloudinary public ID
    }
  ],
  createdId: ObjectId (required)
}
```

## 📸 Image Upload

### Upload with Product Creation

```bash
POST /api/v1/products?createdId=<farmer-id>
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- name: "Fresh Tomatoes"
- price: 150
- description: "Organic tomatoes"
- category: "vegetables"
- StockQuantity: 100
- images: [file1.jpg, file2.jpg]  # Max 5 files
```

### Update Product Images

```bash
PATCH /api/v1/products/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- price: 200                    # Optional: update fields
- images: [new1.jpg, new2.jpg]  # Optional: replace images
```

**Note**: Updating images automatically deletes old images from Cloudinary.

### Image Requirements

- **Formats**: JPEG, PNG, WebP
- **Max Size**: 5MB per file, 25MB total
- **Optimization**: Auto-resized to 800x800px, 70% quality
- **Validation**: Magic number checking prevents malicious files

## 📊 Logging

Logs are stored in the `logs/` directory with automatic rotation (max 5MB per file):

- `combined.log` - All logs
- `error.log` - Error level logs
- `security.log` - Security-related events
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

### Log Levels

- `error` - Server errors, critical failures
- `warn` - Failed operations, validation failures
- `security` - Auth failures, rate limit hits
- `info` - Successful operations
- `http` - HTTP requests (Morgan integration)
- `debug` - Development debugging

### Log Structure

```json
{
  "timestamp": "2026-02-14 13:00:00",
  "level": "info",
  "message": "Product created successfully",
  "userId": "507f1f77bcf86cd799439011",
  "productId": "507f1f77bcf86cd799439012",
  "productName": "fresh tomatoes"
}
```

## 🧪 Testing

### Using Postman/Thunder Client

1. **Login to get JWT token**
   ```
   POST /api/v1/login
   Body: { "email": "farmer@example.com", "password": "password" }
   ```

2. **Set Authorization Header**
   ```
   Authorization: Bearer <your-jwt-token>
   ```

3. **Create Product with Images**
   - Method: POST
   - URL: `/api/v1/products?createdId=<your-user-id>`
   - Body: form-data
   - Add text fields: name, price, description, category, StockQuantity
   - Add file fields: images (select up to 5 image files)

## 🔐 Security Best Practices

1. **Never commit** `.env` file to version control
2. **Use strong** JWT secrets (32+ random characters)
3. **Enable HTTPS** in production
4. **Rotate** Cloudinary credentials periodically
5. **Monitor logs** for suspicious activity
6. **Keep dependencies** updated (`npm audit`)
7. **Set** `NODE_ENV=production` in production

## 📁 Project Structure

```
Farmer-_Retail-Backend/
├── config/           # Configuration files (DB, Cloudinary, Multer)
├── controller/       # Request handlers
├── middleware/       # Custom middleware (auth, validation, rate limiting)
├── model/           # Mongoose schemas
├── routes/          # API routes
├── service/         # Business logic (products, images, users)
├── utils/           # Utilities (logger, error handler, JWT, hash)
├── logs/            # Log files (auto-generated)
├── uploads/         # Temporary file storage (auto-cleaned)
├── app.js           # Express app configuration
├── .env             # Environment variables
└── package.json     # Dependencies
```

## 🚦 Error Handling

All errors return a consistent JSON structure:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB` | MongoDB connection string | `mongodb+srv://...` |
| `JWTACCESS` | JWT access token secret | Random 32+ char string |
| `JWTREFRESH` | JWT refresh token secret | Random 32+ char string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,https://myapp.com` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Uday G**

## 🙏 Acknowledgments

- Cloudinary for image hosting
- MongoDB for database
- Express.js community

---

**Built with ❤️ for farmers** 🌾
