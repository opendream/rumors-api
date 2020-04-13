import { GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';

import client from 'util/client';

import Article from 'graphql/models/Article';


/**
 * @param {string} articleId
 * @param {ScrapResult[]} hyperlinks
 * @return {Promise | null} update result
 */
export async function updateArticleStatus(id, status) {
  // if (!categories || categories.length === 0) return Promise.resolve(null);

  return await client.update({
    index: 'articles',
    type: 'doc',
    id: id,
    body: {
      doc: {
        status: status
      }
    },
    _source: true
  });

}

export default {
  type: Article,
  description: 'Update article categories',
  args: {
    id: { type: GraphQLString },
    status: { type: GraphQLString },
  },
  async resolve(rootValue, { id, status }, { appId, userId, loaders }) {

    const user = await loaders.docLoader.load({ index: 'users', id: userId });    
    const article = await loaders.docLoader.load({ index: 'articles', id: id });

    console.log('article', article)

    if (user.isStaff || (userId && article.userId == userId)) {
      const resp = await updateArticleStatus(id, status);
      console.log('resp', resp)
      return resp

    } else {
      throw new Error(
        `Cannot change status for article(articleId=${id})`
      );
    }



  },
};
