const authResolver = require('../resolvers/auth');
const bookingsResolver = require('../resolvers/bookings');
const eventsResolver = require('../resolvers/events');

const rootResolver = {
    ...authResolver,
    ...bookingsResolver,
    ...eventsResolver,
};

module.exports = rootResolver;
