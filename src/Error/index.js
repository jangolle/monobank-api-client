'use strict';

const ExtendableError = require('./ExtendableError');

class InvalidPrivateKeyError extends ExtendableError {}
class InvalidPermissionValueError extends ExtendableError {}
class AccessForbiddenError extends ExtendableError {}
class InvalidRequestParamsError extends ExtendableError {}
class NotFoundError extends ExtendableError {}
class UnauthorizedRequestError extends ExtendableError {}
class UndefinedApiError extends ExtendableError {}
class TooManyRequestsError extends ExtendableError {}

module.exports = {
  InvalidPrivateKeyError,
  TooManyRequestsError,
  InvalidPermissionValueError,
  AccessForbiddenError,
  InvalidRequestParamsError,
  NotFoundError,
  UnauthorizedRequestError,
  UndefinedApiError,
};
