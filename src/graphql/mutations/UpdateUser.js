import { GraphQLString, GraphQLNonNull } from 'graphql';
import client from 'util/client';
import User from 'graphql/models/User';

export default {
  type: User,
  description: 'Change attribute of a user',
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    belongTo: { type: GraphQLString },
    id: { type: GraphQLString },
  },
  async resolve(rootValue, { name, belongTo, id }, ctx) {

    let userId = ctx.userId
    if (ctx.isStaff && id) {
      userId = id
    }


    const {
      result,
      get: { _source },
    } = await client.update({
      index: 'users',
      type: 'doc',
      id: userId,
      body: {
        doc: {
          name,
          belongTo: belongTo || undefined,
          updatedAt: new Date().toISOString(),
        },
        _source: true,
      },
    });

    if (result === 'noop') {
      throw new Error(`Cannot change name for user`);
    }

    return { id: userId, ..._source };
  },
};
