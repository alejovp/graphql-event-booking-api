const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');


const fetchEvents = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
        .then(events => {
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: fetchUser.bind(this, event._doc.creator)
                }
            })
        })
};

const fetchUser = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                _id: user.id,
                createdEvents: fetchEvents.bind(this, user._doc.createdEvents)
            }
        })
        .catch(err => {
            throw err;
        });
};

module.exports = {
    // resolvers list
    events: () => {
        return Event
            .find()
            .then(events => {
                return events.map(event => {
                    // return { ...event._doc, _id: event._doc._id.toString() }
                    // return { ...event._doc, _id: event.id }
                    return {
                        ...event._doc,
                        date: new Date(event._doc.date).toISOString(),
                        creator: fetchUser.bind(this, event._doc.creator)
                    }
                });
            })
            .catch(err => {
                throw err;
            });
    },
    createEvent: args => {
        const { title, description, price, date } = args.eventInput;
        const event = new Event({
            title,
            description,
            price: +price,
            date: new Date(date),
            creator: '5c69d5657768117d64c9a454'
        });
        let createdEvent;

        return event
            .save()
            .then(result => {
                createdEvent = {
                    ...result._doc,
                    date: new Date(result._doc.date).toISOString(),
                    creator: fetchUser.bind(this, result._doc.creator)
                };
                return User.findById('5c69d5657768117d64c9a454');
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found!')
                }
                user.createdEvents.push(event);
                return user.save()
            })
            .then(() => createdEvent)
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    createUser: args => {
        const { email, password } = args.userInput;

        return User
            .findOne({ email })
            .then(user => {
                if (user) {
                    throw new Error('Email supplied already exist!');
                }

                return bcrypt.hash(password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                return { ...result._doc, password: null }
            })
            .catch(err => {
                throw err;
            })
    }
}