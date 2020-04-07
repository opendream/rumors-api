import { GraphQLString, GraphQLNonNull } from 'graphql';
import { h64 } from 'xxhashjs';

import { assertUser } from 'graphql/util';
import client from 'util/client';
import scrapUrls from 'util/scrapUrls';

import { ArticleReferenceInput } from 'graphql/models/ArticleReference';
import MutationResult from 'graphql/models/MutationResult';
import { createOrUpdateReplyRequest } from './CreateOrUpdateReplyRequest';

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
 * Creates a new article in ElasticSearch,
 * or updates its reference by adding a new reference
 *
 * @param {object} param
 * @param {string} param.text
 * @param {ArticleReferenceInput} param.reference
 * @param {string} param.userId
 * @param {string} param.appId
 * @returns {string} the new article's ID
 */
async function createNewArticle({
  text,
  reference: originalReference,
  userId,
  appId,
}) {
  const articleId = getArticleId(text);
  const now = new Date().toISOString();
  const reference = {
    ...originalReference,
    createdAt: now,
    userId: userId,
    appId: appId,
  };

  await client.update({
    index: 'articles',
    type: 'doc',
    id: articleId,
    body: {
      script: {
        source: `
          ctx._source.updatedAt = params.updatedAt;
          ctx._source.references.add(params.reference);
        `,
        lang: 'painless',
        params: {
          updatedAt: now,
          reference,
        },
      },
      upsert: {
        text,
        createdAt: now,
        updatedAt: now,
        userId,
        appId,
        references: [reference],
        articleReplies: [],
        normalArticleReplycount: 0,
        replyRequestCount: 0,
        tags: [],
        hyperlinks: [],
      },
    },
    refresh: true, // Make sure the data is indexed when we create ReplyRequest
  });

  return articleId;
}

/**
 * @param {string} articleId
 * @param {ScrapResult[]} hyperlinks
 * @return {Promise | null} update result
 */
export function updateArticleHyperlinks(articleId, scrapResults, originHyperlinks) {
  if (!scrapResults || scrapResults.length === 0) return Promise.resolve(null);

  const scrapResult = scrapResults[0]

  updateHyperlinks = originHyperlinks
  updateHyperlinks.forEach((hyperlink, i) => {
    if (hyperlink.url == scrapResult.url) {
      updateHyperlinks[i] = scrapResult
    }
  })
    

  return client.update({
    index: 'articles',
    type: 'doc',
    id: articleId,
    body: {
      doc: {
        hyperlinks: scrapResults.map(
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
  description: 'Create an article and/or a replyRequest',
  args: {
    articleId: { type: new GraphQLNonNull(GraphQLString) },
    url: { type: new GraphQLNonNull(GraphQLString) },
    // reference: { type: new GraphQLNonNull(ArticleReferenceInput) },
  },
  resolve: async (rootValue, {articleId, url}, { loaders }) => {

    const article = await loaders.docLoader.load({ index: 'articles', id: articleId })

    const originHyperlinks = article.hyperlinks
    const scrapPromise = scrapUrls(url, {
      // cacheLoader: loaders.urlLoader,
      client,
    });

    const hyperlinkPromise = Promise.all([
      scrapPromise,
    ]).then(([articleId, scrapResults]) => {
      return updateArticleHyperlinks(articleId, scrapResults, originHyperlinks);
    });

    // Wait for all promises
    return Promise.all([
      hyperlinkPromise,
    ]).then(([id]) => ({ id }));
  },
};
