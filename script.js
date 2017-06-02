const $ = jQuery = require("./jquery-2.1.4.min.js");
const ipcRenderer = require('electron').ipcRenderer;
let multi = [];

//TODO: 無限に追加されてくので置き換え必要
function printArrayElement(tweet, index, array) {
    const tweetElement = $('#tw_' + tweet.id_str);
    Object.keys(multi).forEach(function(key) {
        const keyElement = $('#' + key);
        if (tweet.text.includes(this[key]) && !(tweetElement.is('*'))) {
            const helpNum = tweet.text.match(/[A-Z0-9]{8}/);
            keyElement.prepend('<p class="time">' + new Date(tweet.created_at).toLocaleString() + '</p>');
            keyElement.prepend('<p id="tw_' + tweet.id_str + '"></p>');
            $('#tw_' + tweet.id_str).text('@' + tweet.user.screen_name + ': ' + tweet.text);
            keyElement.prepend('<span class="' + helpNum + '">' + helpNum + '</span>');
            keyElement.prepend('<button id="' + helpNum + '" class="copy">copy</button>');
        }
    }, multi);
}

$(function(){
    ipcRenderer.send('require_setting', '');

    ipcRenderer.on('tweet', function(event, arg) {
        JSON.parse(arg).statuses.forEach(printArrayElement);
    });

    ipcRenderer.on('send_setting', function(event, arg) {
        multi = JSON.parse(arg);
        Object.keys(multi).forEach(function(key) {
            $('#tab').prepend('<li><button>' + this[key] + '</button></li>');
            $('#tweet').prepend('<hr /><div id="' + key + '"></div>');
        }, multi);
    });
});

$(document).on('click', 'li', function() {
    const index = $('#tab').children('li').index(this);
    const tweetBlocks = $('#tweet').find('div');
    tweetBlocks.css('display', 'none');
    $('hr').css('display', 'none');
    tweetBlocks.eq(index).css('display','block');
});

$(document).on('click', '.copy', function() {
    const range = document.createRange();
    const id = $(this).attr('id');
    const target = $('.' + id)[0];
    range.selectNode(target);

    const selection = window.getSelection();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
});

const KeyCodeF1 = 112;
$(document).on('keydown', 'body', function(event) {
    if (event.keyCode === KeyCodeF1) {
        ipcRenderer.send('setting', '');
        return false;
    }
});
