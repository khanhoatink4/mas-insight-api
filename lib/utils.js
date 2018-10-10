'use strict';

var _ = require('lodash');
var async = require('async');
var Common = require('./common');

function UtilsController(node) {
    this.node = node;
    this.common = new Common({log: this.node.log});
}

UtilsController.prototype.estimateFee = function (req, res) {
    var self = this;
    var args = req.query.nbBlocks || '2';
    var nbBlocks = args.split(',');

    async.map(nbBlocks, function (n, next) {
        var num = parseInt(n);
        // Insight and Bitcoin JSON-RPC return bitcoin for this value (instead of satoshis).
        self.node.services.bitcoind.estimateFee(num, function (err, fee) {
            if (err) {
                return next(err);
            }
            // convert fee from BTC/KB -> satoshi/byte
            var tmpFee = Math.ceil(fee * Math.pow(10, 8) / 1000);
            next(null, [num, tmpFee]);
        });
    }, function (err, result) {
        if (err) {
            return self.common.handleErrors(err, res);
        }
        res.jsonp(_.zipObject(result));
    });

};

module.exports = UtilsController;
