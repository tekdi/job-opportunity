export const userServiceConfig = {
  baseUrl: process.env.USER_SERVICE_BASE_URL || 'http://localhost:3002',
  timeout: parseInt(process.env.USER_SERVICE_TIMEOUT || '600000', 10),
  endpoints: {
    getUser: '/users',
    getUserProfile: '/users/profile',
    getYouthList: '/user/v1/list',
  },
};
