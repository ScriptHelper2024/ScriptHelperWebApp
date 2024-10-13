from graphene import ObjectType, NonNull, Int

class PagedResult(ObjectType):
    pages = NonNull(Int)