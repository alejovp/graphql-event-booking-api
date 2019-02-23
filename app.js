const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const mongoose = require('mongoose');
const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');
const { PORT, MONGO_USER, MONGO_PASSWORD, MONGO_DB } = process.env;

const app = express();

app.use(bodyParser.json());

app.use('/graphql-api', graphQlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

mongoose
    .connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@training-wex3i.mongodb.net/${MONGO_DB}?retryWrites=true`)
    .then(() => {
        app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
    })
    .catch((err) => console.log(err))
