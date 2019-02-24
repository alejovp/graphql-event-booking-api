const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');


const fetchEvents = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    }
};

const fetchOneEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (error) {
        throw error;
    }
}

const fetchUser = async userId => {
    try {     
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: fetchEvents.bind(this, user._doc.createdEvents)
        };
    } catch (error) {
        throw error;
    };
};

const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: fetchUser.bind(this, event._doc.creator)
    };
}

const transformBooking = booking => {
    return {
        ...booking._doc,
        // _id: booking.id,
        event: fetchOneEvent.bind(this, booking._doc.event),
        user: fetchUser.bind(this, booking._doc.user),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt),
    };
}


module.exports = {
    // fetchEvents,
    // fetchOneEvent,
    // fetchUser,
    transformEvent,
    transformBooking
};