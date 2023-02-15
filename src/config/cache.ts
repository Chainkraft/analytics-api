import NodeCache from 'node-cache';

export const BlockNumberCache = new NodeCache({ stdTTL: 600 });
