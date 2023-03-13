import NodeCache from 'node-cache';

export const BlockNumberCache = new NodeCache({ stdTTL: 600 });
export const LoggedUserCache = new NodeCache({ stdTTL: 60 });
