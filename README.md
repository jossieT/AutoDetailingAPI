# Car Detailing Service API 🚗💨

A robust backend API for managing car detailing service bookings, staff schedules, and business operations.

## Features ✨

- **Booking Management**
  - Create/update/cancel appointments
  - Vehicle details tracking
  - Service package selection
  - Real-time availability checks
  - Image uploads for vehicle documentation

- **Staff Management**
  - Day-off requests
  - Working hour configurations
  - Shift assignments
  - Availability tracking

- **Business Operations**
  - Service package configurations
  - Add-on services management
  - Pricing calculations
  - Operational analytics

- **Key Components**
  - Joi validation for all endpoints
  - Error handling middleware
  - Rate limiting and security headers
  - MongoDB data modeling
  - Cloudinary image management
  - Automated time slot management

## Technologies 🛠️

**Backend**
- Node.js
- Express.js
- MongoDB/Mongoose
- Joi Validation
- Cloudinary SDK
- Winston Logging

**Database**
- MongoDB Atlas
- Mongoose ODM
- Index Optimization
- Schema Validation

**Tools**
- Postman (API Testing)
- ESLint (Code Quality)
- Prettier (Code Formatting)
- Git (Version Control)

## Installation ⚙️

1. Clone repository:
bash
git clone https://github.com/yourusername/car-detailing-api.git
cd car-detailing-api

2. Install dependencies:
npm install

3. Configure environment variables:
cp .env.example .env

npm run dev

## Configuration 🔧

Create `.env` file with these variables:

PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100


## API Endpoints 📡

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id` - Update booking status

### Services
- `POST /api/services` - Create new service
- `GET /api/services` - List all services
- `PUT /api/services/:id` - Update service

### Day Offs
- `POST /api/dayoffs` - Create day-off entry
- `GET /api/dayoffs` - List all day-offs
- `DELETE /api/dayoffs/:id` - Cancel day-off

### Staff
- `POST /api/staff` - Register new staff member
- `POST /api/staff/login` - Staff login
- `GET /api/staff/availability` - Check staff availability

[View Full API Documentation](docs/API.md)

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Built with ❤️ using Express.js
- MongoDB for powerful data management
- Joi for robust request validation
- Cloudinary for secure media storage


