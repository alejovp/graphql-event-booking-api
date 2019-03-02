const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./populators');


module.exports = {
    // resolvers list
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated request!');
        }
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
            
        } catch (error) {
            throw error;
        }
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated request!');
        }

        const { eventId } = args;
        const fetchedEvent = await Event.findOne({ _id: eventId});
        const newBooking = new Booking({
            event: fetchedEvent,
            user: req.userId
        })
        
        try {
            const result = await newBooking.save();
            return transformBooking(result);
        } catch (error) {
            throw error;
        }   
    },
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated request!');
        }

        const { bookingId } = args;

        try {
            const bookingToDelete = await Booking.findById(bookingId).populate('event');
            const relatedEvent = transformEvent(bookingToDelete.event);
            await Booking.deleteOne({ _id: bookingId });
            return relatedEvent;
        } catch (error) {
            throw error
        }
    }
}