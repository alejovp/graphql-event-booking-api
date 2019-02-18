const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');
const { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DB } = process.env;

const app = express();


app.use(bodyParser.json());

app.use('/graphql-api', graphQlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        // resolvers list
        events: () => {
            return Event
                .find()
                .then(events => {
                    return events.map(event => {
                        // return { ...event._doc, _id: event._doc._id.toString() }
                        // return { ...event._doc, _id: event.id }
                        return { ...event._doc }
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
                    createdEvent = { ...result._doc };
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
    },
    graphiql: true
}));

mongoose
    .connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@training-wex3i.mongodb.net/${MONGO_DB}?retryWrites=true`)
    .then(() => {
        app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
    })
    .catch((err) => console.log(err))
