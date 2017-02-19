// ==UserScript==
// @name         SteamTrades Enhancer
// @namespace    https://github.com/Nuklon
// @author       Nuklon
// @license      MIT
// @version      1.0.0
// @description  Enhances SteamTrades
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://raw.githubusercontent.com/caolan/async/master/dist/async.min.js
// @match        *://www.steamtrades.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function($, async) {
    // You can request an API key here: http://steamcommunity.com/dev/apikey
    const apiKey = '';
    var cache = new Map();

    var summaryQueue = async.queue(function (task, next) {
        var url = task;
        var link = url.attr('href');
        var hasAuthorName = typeof url.attr('class') !== 'undefined' && (url.attr('class').includes('author_name') || url.attr('class').includes('underline'));
        if (hasAuthorName && typeof link !== 'undefined' && link.includes('/user/')) {
            link = link.replace('/user/', '');
            var apiUrl = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apiKey +'&steamids=' + link;

            if (cache.has(apiUrl)) {
                var originalText = url.text();
                url.text(originalText + ' → ' + cache.get(apiUrl));
                url.attr('title', originalText);

                next();
            }
            else {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: apiUrl,
                    onload: function (data) {
                        if (data.status != 200) {
                            next();

                            return;
                        }

                        data = data.response;
                        var json = JSON.parse(data);

                        if (typeof json !== 'undefined' && typeof json.response !== 'undefined' && typeof json.response.players !== 'undefined') {
                            if (json.response.players.length > 0) {
                                if (typeof json.response.players[0].personaname !== 'undefined') {
                                    cache.set(apiUrl, json.response.players[0].personaname);

                                    var originalText = url.text();
                                    url.text(originalText + ' → ' + cache.get(apiUrl));
                                    url.attr('title', originalText);
                                }
                            }
                        }

                        next();
                    }});
            }
        } else {
            next();
        }
        }, 4);

    $(document).ready(function() {
         $('a').each(function(i) {
             summaryQueue.push($(this));
         });
    });
})(jQuery, async);
