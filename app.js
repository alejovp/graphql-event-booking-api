const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 3000;

const app = express();

const events = [];

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
            return events;
        },
        createEvent: args => {
            const { title, description, price, date } = args.eventInput;
            const event = {
                _id: Math.random().toString(),
                title,
                description,
                price: +price,
                date
            };
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));


app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));