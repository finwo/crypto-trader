import { ApolloServer, gql } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import * as config from '@config';

export async function apply({ app }) {
  const schema = await buildSchema({
    resolvers  : [__dirname+'/../resolver/*.js'],
    container  : Container,
  });
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req, res,
      auth : req[config.auth.requestProperty],
    })
  });
  await server.start();
  server.applyMiddleware({
    app, path :'/graphql',
  });
}
