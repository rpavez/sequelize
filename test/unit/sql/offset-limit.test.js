'use strict';

/* jshint -W110 */
var Support   = require(__dirname + '/../support')
  , util = require('util')
  , expectsql = Support.expectsql
  , current   = Support.sequelize
  , sql       = current.dialect.QueryGenerator;

// Notice: [] will be replaced by dialect specific tick/quote character when there is not dialect specific expectation but only a default expectation

suite(Support.getTestDialectTeaser('SQL'), function() {
  suite('offset/limit', function () {
    var testsql = function (options, expectation) {
      var model = options.model;

      test(util.inspect(options, {depth: 2}), function () {
        return expectsql(
          sql.addLimitAndOffset(
            options,
            model
          ),
          expectation
        );
      });
    };

    testsql({
      limit: 10,//when no order by present, one is automagically prepended, test it's existence
      model:{primaryKeyField:'id', name:'tableRef'}
    }, {
      default: ' LIMIT 10',
      oracle: ' ORDER BY id OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY',
      mssql: ' ORDER BY [tableRef].[id] OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
    });

    testsql({
      limit: 10,
      order: [
        ['email', 'DESC'] // for MSSQL
      ]
    }, {
      default: ' LIMIT 10',
      oracle: ' OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY',
      mssql: ' OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY'
    });

    testsql({
      limit: 10,
      offset: 20,
      order: [
        ['email', 'DESC'] // for MSSQL
      ]
    }, {
      default: ' LIMIT 20, 10',
      postgres: ' LIMIT 10 OFFSET 20',
      oracle: ' OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY',
      mssql: ' OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY'
    });

    testsql({
      limit: "';DELETE FROM user",
      order: [
        ['email', 'DESC'] // for MSSQL
      ]
    }, {
      default: " LIMIT ''';DELETE FROM user'",
      mysql: " LIMIT '\\';DELETE FROM user'",
      oracle: " OFFSET 0 ROWS FETCH NEXT ''';DELETE FROM user' ROWS ONLY",
      mssql: " OFFSET 0 ROWS FETCH NEXT N''';DELETE FROM user' ROWS ONLY"
    });

    testsql({
      limit: 10,
      offset: "';DELETE FROM user",
      order: [
        ['email', 'DESC'] // for MSSQL
      ]
    }, {
      sqlite: " LIMIT ''';DELETE FROM user', 10",
      oracle: " OFFSET ''';DELETE FROM user' ROWS FETCH NEXT 10 ROWS ONLY",
      postgres: " LIMIT 10 OFFSET ''';DELETE FROM user'",
      mysql: " LIMIT '\\';DELETE FROM user', 10",
      mssql: " OFFSET N''';DELETE FROM user' ROWS FETCH NEXT 10 ROWS ONLY"
    });
  });
});
