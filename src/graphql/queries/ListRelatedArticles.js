import { GraphQLString, GraphQLInputObjectType, GraphQLBoolean } from 'graphql';
import client from 'util/client';

import {
  createFilterType,
  createSortType,
  createConnectionType,
  getSortArgs,
  pagingArgs,
} from 'graphql/util';

import Article from 'graphql/models/Article';

export default {
  args: {
    queryText: {
      type: GraphQLString,
      description: 'queryText for getting related articles',
    },
    ...pagingArgs,
  },

  async resolve(rootValue, { orderBy = [], queryText, ...otherParams }, {}) {
    const body = {
      sort: getSortArgs(orderBy),
      track_scores: true, // for _score sorting
    };

    let title = queryText;

    body.query = {
      bool: {
        should: [
          { prefix: { title: title } },
          {
            fuzzy: { text: { value: title, fuzziness: 2, prefix_length: 0 } },
          },
        ],
      },
    };

    return {
      index: 'articles',
      type: 'doc',
      body,
      ...otherParams,
    };
  },
  type: createConnectionType('ListArticleConnection', Article),
};
