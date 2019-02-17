const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const PORT = 3000;

const app = express();

app.use(bodyParser.json());

app.use('/graphql-api', graphQlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        // resolvers list
        events: () => {
            return ['Romantic Cooking', 'Sailing', 'All-Night Coding']
        },
        createEvent: args => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));


app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));