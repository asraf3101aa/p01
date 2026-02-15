import config from '../config';

export const serviceError = (error: any, message: string) => {
    const isDevOrStaging = config.env === 'development' || config.env === 'staging';

    return {
        message: isDevOrStaging ? (error?.message || message) : message,
    };
};