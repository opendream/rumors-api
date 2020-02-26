import { GraphQLString } from 'graphql';

import User from 'graphql/models/User';

export default {
  type: User,
  description: `
    Gets specified user. If id is not given, returns the currently logged-in user.
    Note that some fields like email is not visible to other users.
  `,
  args: {
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  resolve(rootValue, { email, password }, { user = null, loaders }) {
    if (!email || !password) return user;

    return loaders.searchResultLoader.load({
      index: 'users',
      body: { query: { term: { email } } },
    }).then(results => {
      console.log('results', results[0])

      // TODO: create user with email and password if user dose not exist
      if (results.length === 0) {
        
      }

      // TODO: check password if user exist

      return results.length == 1? results[0]: null;

    })
  },
};
