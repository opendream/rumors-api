import { GraphQLEnumType } from 'graphql';

export default new GraphQLEnumType({
  name: 'ReplyTypeEnum',
  description: 'Reflects how the replier categories the replied article.',
  values: {
    RUMOR: {
      value: 'RUMOR',
      description:
        'The replier thinks that the article contains false information.',
    },
    RUMOR_NOT_RUMOR: {
      value: 'RUMOR_NOT_RUMOR',
      description:
        'The replier thinks that the articles contains no false information.',
    },
    NOT_RUMOR: {
      value: 'NOT_RUMOR',
      description:
        'The replier thinks that the article almost true information.',
    },
    NOT_ARTICLE: {
      value: 'NOT_ARTICLE',
      description:
        'The replier thinks that the article is actually not a complete article on the internet or passed around in messengers.',
    },
    OPINIONATED: {
      value: 'OPINIONATED',
      description:
        'The replier thinks that the article contains personal viewpoint and is not objective.',
    },
  },
});
