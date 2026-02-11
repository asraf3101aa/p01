import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';

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

// v1 api routes
app.use('/', routes);

// // send back a 404 error for any unknown api request
// app.use((_req: Request, _res: Response, next: NextFunction) => {
//     next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

export default app;
