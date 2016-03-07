'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var supertest = require('supertest');
var echo = require('./support/echo-server');
var mg = require('../lib/microgw');
var should = require('should');

describe('set-variable policy', function() {

  var request;
  before(function(done){
    process.env.CONFIG_DIR = __dirname + '/definitions/set-variable';
    process.env.NODE_ENV = 'production';
    mg.start(3000)
      .then(function() {
        return echo.start(8889);
      })
      .then(function() {
        request = supertest('http://localhost:3000');
      })
      .then(done)
      .catch(function(err) {
        console.error(err);
        done(err);
      });
  });

  after(function(done) {
    return mg.stop()
      .then(function() { return echo.stop(); })
      .then(done, done)
      .catch(done);
    delete process.env.CONFIG_DIR;
    delete process.env.NODE_ENV;
  });

  it('should set a simple string to a variable', function(done) {
    request
      .post('/set-variable/set-variable')
      .set('set-variable-case', 'set')
      .expect('X-Test-Set-Variable', 'value1')
      .expect(200, done);
  });

  it('should able to append on existing context variable', function(done) {
    request
      .post('/set-variable/set-variable')
      .set('set-variable-case', 'set-and-add')
      .expect('X-Test-Set-Variable', 'value1, value2')
      .expect(200, done);
  });

  it('should able to clear existing context variable', function(done) {
    request
      .post('/set-variable/set-variable')
      .set('set-variable-case', 'clear')
      .set('to-be-deleted', 'test-value')
      .expect('to-be-deleted', '')
      .expect(200, done);
  });

});

