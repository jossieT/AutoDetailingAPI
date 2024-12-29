const express = require('express');
const authRouter = require('./routes/auth.route');
const serviceRouter = require('./routes/service.route');
const galleryRouter = require('./routes/gallery.route');
const testimonialRouter = require('./routes/testimonial.route');
const bookingRouter = require('./routes/booking.route');
const companyOverviewRouter = require('./routes/company.overview.route')
const teamMemberRouter = require('./routes/team.member.route');
const dayOffRouter = require('./routes/day-off.route');
const staffRouter = require('./routes/staff.route');
const addOnRoutes = require('./routes/addon.service.route');
const blogRoutes = require('./routes/blog.routes');

const { errorHandler, errorConverter } = require('./middlewares/error');
const { ApiError } = require('./utils/ApiError');
const httpStatus = require('http-status');
const morgan = require('./config/morgan');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const { swaggerDocs } = require('./swaggerConfig');
const config = require('./config/config');
const cors = require('cors');
const bodyParser = require('body-parser');


//const { xss } = require("express-xss-sanitizer");
const xssClean = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

//const bodyParser = require('body-parser');
const app = express();


const allowedOrigins = [
  'https://www.swiftaddisdetailing.com',
  'https://swift-addis.vercel.app',
];

// CORS middleware for multiple origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true); // Origin is allowed
    } else {
      return callback(new Error('Not allowed by CORS')); // Origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies if needed
}));

app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//enabling cross origin
// if (config.env === 'production') {
//   app.use(cors({ origin: 'url' }));
//   app.options('*', cors({ origin: 'url' }));
// } else {
//   // enabling all cors
//   app.use(cors());
//   app.options('*', cors());
// }
// Initialize Swagger
swaggerDocs(app, config.port);
//Security
app.use(xssClean());
app.use(helmet.contentSecurityPolicy(config.cspOptions));
app.use(mongoSanitize());

// Middleware to parse incoming request bodies
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
//routes
app.use(authRouter);
app.use(serviceRouter);
app.use(galleryRouter);
app.use(testimonialRouter);
app.use(bookingRouter);
app.use(companyOverviewRouter);
app.use(teamMemberRouter);
app.use(dayOffRouter);
app.use(staffRouter);
app.use(addOnRoutes);
app.use('/api/blogs', blogRoutes);
app.use(errorConverter);
app.use(errorHandler);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not Found'));
});

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;