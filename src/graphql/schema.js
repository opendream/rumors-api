import { GraphQLObjectType, GraphQLSchema } from 'graphql';

// Get individual objects
import GetArticle from './queries/GetArticle';
import GetReply from './queries/GetReply';
import GetUser from './queries/GetUser';
import ListArticles from './queries/ListArticles';
import ListReplies from './queries/ListReplies';
import ListUsers from './queries/ListUsers';

// Set individual objects
import CreateArticle from './mutations/CreateArticle';
import CreateReply from './mutations/CreateReply';
import CreateArticleReply from './mutations/CreateArticleReply';
import CreateOrUpdateArticleReplyFeedback from './mutations/CreateOrUpdateArticleReplyFeedback';
import CreateOrUpdateReplyRequestFeedback from './mutations/CreateOrUpdateReplyRequestFeedback';
import CreateOrUpdateReplyRequest from './mutations/CreateOrUpdateReplyRequest';
import UpdateArticleReplyStatus from './mutations/UpdateArticleReplyStatus';
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
      UpdateArticleReplyStatus,
      UpdateUser,
    },
  }),
});
