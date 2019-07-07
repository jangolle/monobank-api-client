'use strict';

const Enum = require('./Enum');

class Permission extends Enum {}

Permission.GET_STATEMENT = new Permission('s');
Permission.GET_PERSONAL_INFO = new Permission('p');

module.exports = Permission;
