import { GraphQLString, GraphQLInputObjectType, GraphQLBoolean } from 'graphql';
import client from 'util/client';

import {
  createFilterType,
  createSortType,
  createConnectionType,
  getSortArgs,
  pagingArgs,
} from 'graphql/util';
import scrapUrls from 'util/scrapUrls';

import User from 'graphql/models/User';

export default {
  args: {
    // filter: {
    //   type: createFilterType('ListUserFilter', {
    //   }),
    // },
    orderBy: {
      type: createSortType('ListUserOrderBy', ['_score', 'createdAt']),
    },
    ...pagingArgs,
  },
  async resolve(
    rootValue,
    { filter = {}, orderBy = [], ...otherParams },
    { userId, appId, loaders }
  ) {
    const body = {
      sort: getSortArgs(orderBy),
      track_scores: true, // for _score sorting
    };

    // Collecting queries that will be used in bool queries later
    const shouldQueries = []; // Affects scores
    const filterQueries = []; // Not affects scores

    body.query = {
      bool: {
        should:
          shouldQueries.length === 0 ? [{ match_all: {} }] : shouldQueries,
        filter: filterQueries,
        minimum_should_match: 1, // At least 1 "should" query should present
      },
    };

    // should return search context for resolveEdges & resolvePageInfo
    return {
      index: 'users',
      type: 'doc',
      body,
      ...otherParams,
    };
  },
  type: createConnectionType('ListUserConnection', User),
};
