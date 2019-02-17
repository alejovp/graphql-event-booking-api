const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');


const { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DB } = process.env;

const Event = require('./models/event');

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

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
                date: new Date(date)     
            });

            return event
                .save()
                .then(result => {
                    console.log(result);
                    // return { ...result._doc, _id: result._doc._id.toString() };
                    return { ...result._doc };
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
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
