import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
import { errorHandler } from './middlewares/error';
import { apiLimiter } from './middlewares/rateLimiter';
import config from './config';

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.set('trust proxy', 1);

// rate limiting
if (config.env === 'production' || config.env === 'staging') {
    app.use('/', apiLimiter);
}

// api routes
app.use('/', routes);

// handle error
app.use(errorHandler);

export default app;
