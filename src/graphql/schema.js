import { GraphQLObjectType, GraphQLSchema } from 'graphql';

// Get individual objects
import GetArticle from './queries/GetArticle';
import GetReply from './queries/GetReply';
import GetUser from './queries/GetUser';
import ListArticles from './queries/ListArticles';
import ListReplies from './queries/ListReplies';
import ListUsers from './queries/ListUsers';
import ListTags from './queries/ListTags';

// Set individual objects
import CreateArticle from './mutations/CreateArticle';
import CreateReply from './mutations/CreateReply';
import CreateArticleReply from './mutations/CreateArticleReply';
import CreateOrUpdateArticleReplyFeedback from './mutations/CreateOrUpdateArticleReplyFeedback';
import CreateOrUpdateReplyRequestFeedback from './mutations/CreateOrUpdateReplyRequestFeedback';
import CreateOrUpdateReplyRequest from './mutations/CreateOrUpdateReplyRequest';
import CreateOrUpdateTag from './mutations/CreateOrUpdateTag';
import UpdateArticleReplyStatus from './mutations/UpdateArticleReplyStatus';
import UpdateArticleCategories from './mutations/UpdateArticleCategories';
import UpdateArticleHyperlink from './mutations/UpdateArticleHyperlink';
import UpdateReplyHyperlink from './mutations/UpdateReplyHyperlink';
import UpdateUser from './mutations/UpdateUser';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      GetArticle,
      GetReply,
      GetUser,
      ListArticles,
      ListReplies,
      ListUsers,
      ListTags,
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      CreateArticle,
      CreateReply,
      CreateArticleReply,
      CreateReplyRequest: {
        ...CreateOrUpdateReplyRequest,
        deprecationReason: 'Use CreateOrUpdateReplyRequest instead',
      },
      CreateOrUpdateReplyRequest,
      CreateOrUpdateArticleReplyFeedback,
      CreateOrUpdateReplyRequestFeedback,
      CreateOrUpdateTag,
      UpdateArticleReplyStatus,
      UpdateArticleCategories,
      UpdateArticleHyperlink,
      UpdateReplyHyperlink,
      UpdateUser,
    },
  }),
});
