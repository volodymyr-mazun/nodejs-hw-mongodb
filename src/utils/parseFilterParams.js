const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;
  const allowedTypes = ['work', 'home', 'personal'];
  const normalized = type.toLowerCase();

  if (allowedTypes.includes(normalized)) {
    return normalized;
  }
};

const parseIsFavourite = (value) => {
  if (typeof value !== 'string') return;

  const normalized = value.toLowerCase();

  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;
  const parsedType = parseType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  const filter = {};

  if (parsedType) {
    filter.contactType = parsedType;
  }

  if (typeof parsedIsFavourite === 'boolean') {
    filter.isFavourite = parsedIsFavourite;
  }

  return filter;
};
