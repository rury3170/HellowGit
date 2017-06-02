const $ = jQuery = require("./jquery-2.1.4.min.js");
const sisyo = require('./resources/sisyo.json');
const multi = require('./resources/multi.json');
const ipcRenderer = require('electron').ipcRenderer;

$(function() {
    const form = $('#multi');
    multi.forEach(function(value) {
        form.prepend(value + ': <input type="checkbox" class="select" name="' + value + '" /><br />');
    })
});

$(document).on('click', '#setting_submit', function(event) {
    const setting = [];
    $('.select').each(function() {
        if ($(this).prop('checked')) setting.push($(this).attr('name'));
    });

    ipcRenderer.send('setting_submit', setting);
    event.preventDefault();
});

$(document).on('click', '#setting_sisyo', function() {
    if ($(this).prop('checked')) {
        const form = $('#multi');
        form.prepend('<div id="sisyo"></div>');
        sisyo.forEach(function(value) {
            $('#sisyo').prepend(value + ': <input type="checkbox" class="select" name="' + value + '" /><br />');
        })
    } else {
        $('#sisyo').empty();
    }
});
