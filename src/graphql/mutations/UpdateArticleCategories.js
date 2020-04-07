import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';
import { h64 } from 'xxhashjs';

import { assertUser } from 'graphql/util';
import client from 'util/client';

import MutationResult from 'graphql/models/MutationResult';
import Article from 'graphql/models/Article';

/* Instantiate hash function */
const xxhash64 = h64();

/**
 * Generates ID from article text. Outputs identical ID when the given the same article text.
 *
 * Used for preventing identical articles sending in within a short amount of time,
 * i.e. while other articles are sending in.
 *
 * @param {string} text The article text
 * @returns {string} generated article ID
 */
export function getArticleId(text) {
  return xxhash64
    .update(text)
    .digest()
    .toString(36);
}


/**
 * @param {string} articleId
 * @param {ScrapResult[]} hyperlinks
 * @return {Promise | null} update result
 */
export async function updateArticleCategories(id, categories) {
  // if (!categories || categories.length === 0) return Promise.resolve(null);



  const articleUpdateResult = await client.update({
    index: 'articles',
    type: 'doc',
    id: id,
    body: {
      doc: {
        categories: categories
      }
    },
    _source: true
  });

  let data = articleUpdateResult.get._source;
  data.id = articleUpdateResult._id

  return data
}

export default {
  type: Article,
  description: 'Update article categories',
  args: {
    id: { type: GraphQLString },
    categories: { type: new GraphQLList(GraphQLString) },
  },
  resolve(rootValue, { id, categories }, { appId, userId, loaders }) {
    // assertUser({ appId, userId });
    return updateArticleCategories(id, categories)
  },
};
