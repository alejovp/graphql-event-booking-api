const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./populators');


module.exports = {
    // resolvers list
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                // return { ...event._doc, _id: event._doc._id.toString() }
                // return { ...event._doc, _id: event.id }
                return transformEvent(event);
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
            let createdEvent = transformEvent(result);

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
}