import mineflayer from "mineflayer";
import webInventory from "mineflayer-web-inventory";
import mineflayerViewer from "prismarine-viewer";
import readline from "readline";
import fs from "fs";

// Setup global bot arguments
let botSetting = {
    username: 'HPTMC',
    host: 'eu1.mc.sneaky.ovh',
    port: 30082,
    version: '1.18.2'
};

let options = {
    port: 2000,
    startOnLoad: true,
    windowUpdateDebounceTime: 1000
};

// Bot class
class MCBot {
    // Constructor
    constructor() {
        this.username = botSetting['username'];
        this.host = botSetting['host'];
        this.port = botSetting['port'];
        this.version = botSetting['version'];

        // Initialize the bot
        this.initBot();
    }

    // Init bot instance
    initBot() {
        this.bot = mineflayer.createBot({
            "username": this.username,
            "host": this.host,
            "port": this.port,
            "version": this.version
        });

        this.bot.once('spawn', () => {
            console.log(`Bot spawned at ${this.bot.entity.position}`);
            fs.appendFileSync('log.txt', `Bot spawned at ${this.bot.entity.position}\n`);
        });

        webInventory(this.bot, options);
        this.initChats();
        this.initgettime();
        //this.initViewer();
    }

    initgettime() {
        // Lấy thời gian hiện tại
        const getTime = new Date();
        // In ra màn hình thời gian ở múi giờ 'Asia/Ho_Chi_Minh'
        const time = getTime.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
        const timeprint = 'Thời gian khởi động bot ở khu vực Asia/Ho_Chi_Minh là: ' + time;
        console.log(timeprint);
        fs.appendFileSync('log.txt', `______________________________________________________________________________________\n`);
        fs.appendFileSync('log.txt', `________________________________BOT ĐÃ CHẠY___________________________________________\n`);
        fs.appendFileSync('log.txt', `______________________________________________________________________________________\n`);
        fs.appendFileSync('log.txt', `${timeprint}\n`);
    }

    initViewer () {
        this.bot.once('spawn', () => {
            mineflayerViewer.mineflayer(this.bot, { port: 3000 }); // Start the viewing server on port 3000

            // Draw the path followed by the bot
            const path = [this.bot.entity.position.clone()];
            this.bot.on('move', () => {
                if (path[path.length - 1].distanceTo(this.bot.entity.position) > 1) {
                    path.push(this.bot.entity.position.clone());
                    this.bot.viewer.drawLine('path', path);
                }
            });
            fs.appendFileSync('log.txt', `Viewer initialized\n`);
        });
    }

    initChats() {
        const rl = readline.createInterface({ // creates our readline interface with our console as input and output
            input: process.stdin,
            output: process.stdout
        });

        this.bot.once('spawn', () => {
            console.log(`Bot joined the game with username ${this.bot.username}.`);
            fs.appendFileSync('log.txt', `Bot joined the game with username ${this.bot.username}.\n`);
            rl.setPrompt('> '); 
            rl.prompt(); // gives us a little arrow at the bottom for the input line
        });

        this.bot.on('message', (message) => {
            readline.moveCursor(process.stdout, -2, 0) // we move the cursor to the left two places because our cursor is already two positions in (because of the input arrow)
            const messageWithColor = message.toAnsi();
            console.log(messageWithColor); // In ra console với màu sắc
            const messageWithoutColor = messageWithColor.toString().replace(/\u001b\[[0-9;]*m/g, ''); // Loại bỏ màu sắc
            fs.appendFileSync('log.txt', `${messageWithoutColor}\n`); // Ghi dữ liệu vào file
            rl.prompt(); // regenerate our little arrow on the input line
        });

        rl.on('line', (line) => {
            readline.moveCursor(process.stdout, 0, -1); // move cursor up one line
            readline.clearScreenDown(process.stdout); // clear all the lines below the cursor (i.e. the last line we entered)
            this.bot.chat(line.toString()); // sends the line we entered to ingame chat
        });

        this.bot.on('kicked', (reason) => {
            console.log(reason);
            fs.appendFileSync('log.txt', `${reason}\n`);
        });

        this.bot.on('error', (error) => {
            console.log(error);
            fs.appendFileSync('log.txt', `${error}\n`);
        });

        this.bot.on('end', async (reason) => {
            // Bot peacefully disconnected
            if (reason == "disconnect.quitting") {
                return;
            }
            // Unhandled disconnections
            else {
                //
            }
            // Attempt to reconnect
            setTimeout(() => {
                this.initBot();
            }, 5000);
        });
    }
}

new MCBot();
