from flask import g  # importing g for fetching request-scoped data


class GraphQLJWTMiddleware(object):

    def resolve(self, next, root, info, **args):
        if g.get('auth_status'):           # copy user object to graphql
            info.context['user'] = g.user  # context if exists
        return next(root, info, **args)
