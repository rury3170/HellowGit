'use strict';

const Electron = require('electron');
const {app, BrowserWindow, ipcMain} = Electron;
const Config = require('config');
const fs = require('fs');
const Twitter = require('twitter');

let win;
let settingWin;
let authWin;
let twitterWin;

app.on('window-all-closed', function() {
    if (process.platform != 'darwin')
        app.quit();
});

app.on('ready', function() {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadURL('file://' + __dirname + '/index.html');

    fs.stat('config/tokens.json', function(err, stat){
        if (err == null) {
            const twitterTokens = JSON.parse(fs.readFileSync('config/tokens.json', 'utf8'));
            const client = new Twitter({
                consumer_key: Config.consumer_key,
                consumer_secret: Config.consumer_secret,
                access_token_key: twitterTokens.oauth_access_token,
                access_token_secret: twitterTokens.oauth_access_token_secret
            });

            setInterval(
                function() {
                    client.get('search/tweets', {q: '参加者募集！参戦ID'}, function(error, tweets, response) {
                        win.webContents.send('tweet', JSON.stringify(tweets));
                    })
                },
                5000
            );
        } else {
            authWin = new BrowserWindow({width: 600, height: 300});
            authWin.loadURL('file://' + __dirname + '/authenticate.html');

            authWin.on('closed', function() {
                authWin = null;
            });
        }
    });

    // filter が日本語に対応してない（クソ）
    // client.stream('statuses/filter', {track: '救援'},  function(stream) {
    //     stream.on('data', function(tweet) {
    //         win.webContents.send('tweet', JSON.stringify(tweet));
    //     });
    //
    //     stream.on('error', function(error) {
    //         console.log(error);
    //     });
    // });

    win.on('closed', function() {
        win = null;
    });

    // 設定画面
    ipcMain.on('setting', function(event, arg){
        settingWin = new BrowserWindow({width: 400, height: 800});
        settingWin.setAlwaysOnTop(true);
        settingWin.loadURL('file://' + __dirname + '/setting.html');

        settingWin.on('closed', function() {
            settingWin = null;
        });
    });

    // 設定反映
    ipcMain.on('setting_submit', function(event, arg){
        settingWin.close();
        fs.writeFile('config/setting.json', JSON.stringify(arg));
        win.reload();
    });

    // 設定ファイル読み込み
    ipcMain.on('require_setting', function(event, arg){
        fs.stat('config/setting.json', function(err, stat){
            if (err == null) {
                let jsonObj = fs.readFileSync('config/setting.json', 'utf8');
                win.webContents.send('send_setting', jsonObj);
            }
        });
    });

    // TwitterのPINコード認証ページ
    ipcMain.on('input_pin', function(event, arg){
        twitterWin = new BrowserWindow({width: 800, height: 600});
        twitterWin.loadURL('https://twitter.com/oauth/authenticate?oauth_token=' + arg);

        twitterWin.on('closed', function(){
            twitterWin = null;
        });
    });

    // Twitterのトークン書き込み
    ipcMain.on('tokens', function(event, arg){
        if (twitterWin != null) {
            twitterWin.close();
        }
        authWin.close();

        fs.writeFile('config/tokens.json', JSON.stringify(arg));
        win.reload();
    });
});
