import { GraphQLString, GraphQLNonNull } from 'graphql';

import client from 'util/client';
import scrapUrls from 'util/scrapUrls';

import MutationResult from 'graphql/models/MutationResult';

/**
 * @param {string} replyId
 * @param {ScrapResult[]} hyperlinks
 * @return {Promise | null} update result
 */
export function updateReplyHyperlinks(replyId, scrapResults, originHyperlinks) {
  if (!scrapResults || scrapResults.length === 0) return Promise.resolve(null);

  const scrapResult = scrapResults[0]

  updateHyperlinks = originHyperlinks
  updateHyperlinks.forEach((hyperlink, i) => {
    if (hyperlink.url == scrapResult.url) {
      updateHyperlinks[i] = scrapResult
    }
  })
    
  return client.update({
    index: 'replies',
    type: 'doc',
    id: replyId,
    body: {
      doc: {
        hyperlinks: updateHyperlinks.map(
          ({ url, normalizedUrl, title, summary }) => ({
            url,
            normalizedUrl,
            title,
            summary,
          })
        ),
      },
    },
  });
}


export default {
  type: MutationResult,
  description: 'Update a reply hyperlink by url.',
  args: {
    replyId: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (rootValue, { replyId, url }, { loaders }) => {
    
    const reply = await loaders.docLoader.load({ index: 'replies', id: replyId })

    const originHyperlinks = reply.hyperlinks
    const scrapPromise = scrapUrls(url, {
      // cacheLoader: loaders.urlLoader,
      client,
    });

    const hyperlinkPromise = Promise.all([
      scrapPromise,
    ]).then(([replyId, scrapResults]) => {
      return updateReplyHyperlinks(replyId, scrapResults, originHyperlinks);
    });

    // Wait for all promises
    return Promise.all([
      hyperlinkPromise,
    ]).then(([id]) => ({ id }));

  },
};
