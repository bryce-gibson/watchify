#!/usr/bin/env node

var watchify = require('../');
var fs = require('fs');
var path = require('path');

var fromArgs = require('browserify/bin/args');
var w = watchify(fromArgs(process.argv.slice(2)));

var outfile = w.argv.o || w.argv.outfile;
var verbose = w.argv.v || w.argv.verbose;

if (!outfile) {
    console.error('You MUST specify an outfile with -o.');
    process.exit(1);
}
var dotfile = path.join(path.dirname(outfile), '.' + path.basename(outfile));

w.on('update', bundle);
bundle();

function bundle () {
    var wb = w.bundle();
    wb.on('error', function (err) {
        console.error(Date.now(), err.stack || err);
    });
    wb.pipe(fs.createWriteStream(dotfile));
    
    var bytes, time;
    wb.on('bytes', function (b) { bytes = b });
    wb.on('time', function (t) { time = t });
    
    wb.on('end', function () {
        fs.rename(dotfile, outfile, function (err) {
            if (err) return console.error(err);
            if (verbose) {
                console.error(bytes + ' bytes written to ' + outfile
                    + ' (' + (time / 1000).toFixed(2) + ' seconds)'
                );
            }
        });
    });
}
