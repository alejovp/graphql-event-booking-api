const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking, transformEvent } = require('./populators');


module.exports = {
    // resolvers list
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });
            
        } catch (error) {
            throw error;
        }
    },
    bookEvent: async args => {
        const { eventId } = args;
        const fetchedEvent = await Event.findOne({ _id: eventId});
        const newBooking = new Booking({
            event: fetchedEvent,
            user: '5c7132666e9eac3f5797de04'
        })
        
        try {
            const result = await newBooking.save();
            return transformBooking(result);
        } catch (error) {
            throw error;
        }   
    },
    cancelBooking: async args => {
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