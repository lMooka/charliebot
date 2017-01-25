'use strict';
var querystring = require('querystring');

var got = require('got');
var safeEval = require('safe-eval');
var languages = require('./languages');

var token;
let baseUrl = 'https://translate.google.com';

function translate(text, opts) {
    opts = opts || {};
    var e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(lang)) {
            e = new Error();
            e.code = 400;
            e.message = 'The language \'' + lang + '\' is not supported';
        }
    });
    if (e) {
        console.log(e);
        return new Promise(function (resolve, reject) {
            reject(e);
        });
    }

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';
    opts.from = languages.getCode(opts.from);
    opts.to = languages.getCode(opts.to);
    return token.get(text).then(function (token) {
        console.log(token);
        var url = `${baseUrl}/translate_a/single`;
        var data = {
            client: 't',
            sl: opts.from,
            tl: opts.to,
            hl: opts.to,
            dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
            ie: 'UTF-8',
            oe: 'UTF-8',
            otf: 1,
            ssel: 0,
            tsel: 0,
            kc: 7
        };
        data[token.name] = token.value;

        let queryUrl = url + '?' + querystring.stringify(data);
        return {
          url: queryUrl,
          text: text
        };
    }).then(function ({url, text}) {
        return got(url, {method: 'POST', body: {q: text}}).then(function (res) {
            var result = {
                text: '',
                from: {
                    language: {
                        didYouMean: false,
                        iso: ''
                    },
                    text: {
                        autoCorrected: false,
                        value: '',
                        didYouMean: false
                    }
                },
                raw: ''
            };

            if (opts.raw) {
                result.raw = res.body;
            }

            var body = safeEval(res.body);
            body[0].forEach(function (obj) {
                if (obj[0] !== undefined) {
                    result.text += obj[0];
                }
            });

            if (body[2] === body[8][0][0]) {
                result.from.language.iso = body[2];
            } else {
                result.from.language.didYouMean = true;
                result.from.language.iso = body[8][0][0];
            }

            if (body[7] !== undefined && body[7][0] !== undefined) {
                var str = body[7][0];

                str = str.replace(/<b><i>/g, '[');
                str = str.replace(/<\/i><\/b>/g, ']');

                result.from.text.value = str;

                if (body[7][5] === true) {
                    result.from.text.autoCorrected = true;
                } else {
                    result.from.text.didYouMean = true;
                }
            }

            return result;
        }).catch(function (err) {
            var e;
            e = new Error();
            if (err.statusCode !== undefined && err.statusCode !== 200) {
                e.code = 'BAD_REQUEST';
            } else {
                e.code = 'BAD_NETWORK';
            }
            throw e;
        });
    });
}

function getTranslate(net = 'com') {
    token = require('google-translate-token-plus')(net);

    baseUrl = `https://translate.google.${net}`;
    return translate;
}

module.exports = getTranslate;
module.exports.languages = languages;
