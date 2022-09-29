export const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
  input.status === 'rejected'

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
  input.status === 'fulfilled'

export const getFulfilled = <T>(input: PromiseSettledResult<T>): PromiseFulfilledResult<T> =>
  isFulfilled(input) ? input : null
