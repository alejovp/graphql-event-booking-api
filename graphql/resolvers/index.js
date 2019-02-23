const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');


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
            console.log(err);
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
    }
}