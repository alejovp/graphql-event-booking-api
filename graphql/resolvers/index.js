const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');


const fetchEvents = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: fetchUser.bind(this, event._doc.creator)
            };
        });
    } catch (err) {
        throw err;
    }
};

const fetchOneEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
            creator: fetchUser.bind(this, event._doc.creator)
        };
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

module.exports = {
    // resolvers list
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                // return { ...event._doc, _id: event._doc._id.toString() }
                // return { ...event._doc, _id: event.id }
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: fetchUser.bind(this, event._doc.creator)
                }
            });
        } catch (error) {
            throw error;
        };
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    // _id: booking.id,
                    event: fetchOneEvent.bind(this, booking._doc.event),
                    user: fetchUser.bind(this, booking._doc.user),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                }
            });
            
        } catch (error) {
            throw error;
        }
    },
    createEvent: async args => {
        const { title, description, price, date } = args.eventInput;
        const event = new Event({
            title,
            description,
            price: +price,
            date: new Date(date),
            creator: '5c69d5657768117d64c9a454'
        });

        try {
            const result = await event.save();
            let createdEvent = {
                ...result._doc,
                date: new Date(result._doc.date).toISOString(),
                creator: fetchUser.bind(this, result._doc.creator)
            };

            const user = await User.findById('5c69d5657768117d64c9a454');
            if (!user) {
                throw new Error('User not found!')
            }
            user.createdEvents.push(event);

            await user.save()
            return createdEvent;
            
        } catch (error) {
            throw err;
        };
    },
    createUser: async args => {
        const { email, password } = args.userInput;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('Email supplied already exist!');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email,
                password: hashedPassword
            });
            
            const result = await user.save();

            return { ...result._doc, password: null };

        } catch (error) {
            throw error;
        };
    },
    bookEvent: async args => {
        const { eventId } = args;

        const newBooking = new Booking({
            event: eventId,
            user: '5c7132666e9eac3f5797de04'
        })
        
        try {
            const result = await newBooking.save();
            return {
                ...result._doc,
                createdAt: new Date(result._doc.createdAt).toISOString(),
                updatedAt: new Date(result._doc.updatedAt).toISOString(),
                event: fetchOneEvent.bind(this, result._doc.event),
                user: fetchUser.bind(this, result._doc.user)
            }
        } catch (error) {
            throw error;
        }   
    },
    cancelBooking: async args => {
        const { bookingId } = args;

        try {
            const bookingToDelete = await Booking.findById(bookingId).populate('event');
            const relatedEvent = {
                ...bookingToDelete.event._doc,
                date: new Date(bookingToDelete.event._doc.date).toISOString(),
                creator: fetchUser.bind(this, bookingToDelete.event._doc.creator)
            }
            await Booking.deleteOne({ _id: bookingId });
            return relatedEvent;
        } catch (error) {
            throw error
        }
    }
}