import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean } from 'graphql';
import { createConnectionType } from 'graphql/util';

const Tag = new GraphQLObjectType({
  name: 'Tag',
  fields: () => ({
    title: { type: GraphQLString },
    priority: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
  }),
});

export default Tag;

export const tagFieldResolver = (
  { title },
  args,
  { loaders, ...context }
) => {
  return loaders.docLoader.load({ index: 'tags', title: title });
};


export const TagConnection = createConnectionType(
  'TagConnection',
  Tag
);
