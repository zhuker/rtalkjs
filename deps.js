#!/usr/bin/env node
var Rx = require('rx');
var NodeRedis = require('redis');
var bluebird = require('bluebird');
var Moment = require('moment-timezone');
var PrintJ = require('printj');

bluebird.promisifyAll(NodeRedis.RedisClient.prototype);
bluebird.promisifyAll(NodeRedis.Multi.prototype);
