const $ = jQuery = require("./jquery-2.1.4.min.js");
const Config = require('config');

const ipcRenderer = require('electron').ipcRenderer;

const OAuth = require('oauth').OAuth;
let oauth = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    Config.consumer_key,
    Config.consumer_secret,
    "1.0",
    undefined,
    "HMAC-SHA1"
);

let oauthConfig = {};

$(document).on('click', '#authenticate', function() {
    oauth.getOAuthRequestToken(function(error, request_oauth_token, request_oauth_token_secret, results){
        ipcRenderer.send('input_pin', request_oauth_token);

        oauthConfig.request_oauth_token = request_oauth_token;
        oauthConfig.request_oauth_token_secret = request_oauth_token_secret;
    });
});

$(document).on('click', '#pin_code', function() {
    let code = $('#input_pin_code').val();
    oauth.getOAuthAccessToken(
        oauthConfig.request_oauth_token,
        oauthConfig.request_oauth_token_secret,
        code,
        function(error2, oauth_access_token, oauth_access_token_secret, results2) {
            ipcRenderer.send('tokens', {
                oauth_access_token: oauth_access_token,
                oauth_access_token_secret: oauth_access_token_secret
            });
        }
    );
});
