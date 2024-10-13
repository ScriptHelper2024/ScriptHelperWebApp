class FilteredDictionary:

    def _to_dict(self):
        raise NotImplementedError("'_to_dict' not implemented")

    def to_dict(self, user=None):
        priviledged = user and (user.id == self.user.id or user.admin_level > 0)

        if not priviledged:
            return {k: v for (k, v) in self._to_dict().items() if k not in self.private}

        return self._to_dict()
