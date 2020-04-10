import { GraphQLString, GraphQLNonNull, GraphQLInt } from 'graphql';
import Tag from '../models/Tag';
import { h64 } from 'xxhashjs';

import client, { processMeta } from 'util/client';

const xxhash64 = h64();


export function getTagId(title) {
  return xxhash64
    .update(title)
    .digest()
    .toString(36);
}
/**
 * Indexes a reply request and increments the replyRequestCount for article
 *
 * @param {TagRequestParam} param
 * @returns {CreateTagRequstResult}
 */
export async function createOrUpdateTagRequest({
  title,
  priority,
}) {
  const now = new Date().toISOString();
  const updatedDoc = {
    title: title,
    priority: priority,
    updatedAt: now,
  };

  const { result } = await client.update({
    index: 'tags',
    type: 'doc',
    id: title,
    body: {
      script: {
        source: `
          ctx._source.title = params.title;
          ctx._source.priority = params.priority;
          ctx._source.updatedAt = params.updatedAt;
        `,
        lang: 'painless',
        params: updatedDoc
      },
      upsert: {
        title,
        priority,
        createdAt: now,
        updatedAt: now,
      }
    },
    refresh: 'true',
  });

  return result
}

export default {
  description: 'Create or update a reply request for the given article',
  type: Tag,
  args: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    priority: { type: GraphQLInt },
  },
  async resolve(rootValue, { title, priority }, { appId, userId }) {
    const { article } = await createOrUpdateTagRequest({
      title,
      priority,
    });
    return article;
  },
};
