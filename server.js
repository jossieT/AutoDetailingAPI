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

const { errorHandler, errorConverter } = require('./middlewares/error');
const { ApiError } = require('./utils/ApiError');
const httpStatus = require('http-status');
const morgan = require('./config/morgan');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');
const { swaggerDocs } = require('./swaggerConfig');
const config = require('./config/config');


//const { xss } = require("express-xss-sanitizer");
const xssClean = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

//const bodyParser = require('body-parser');
const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(express.json());


//enabling cross origin
if (config.env === 'production') {
  app.use(cors({ origin: 'url' }));
  app.options('*', cors({ origin: 'url' }));
} else {
  // enabling all cors
  app.use(cors());
  app.options('*', cors());
}
// Initialize Swagger
swaggerDocs(app, config.port);
//Security
app.use(xssClean());
app.use(helmet.contentSecurityPolicy(config.cspOptions));
app.use(mongoSanitize());
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

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not Found'));
});

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;