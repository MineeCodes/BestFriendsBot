const fs = require('fs');
const config = require('./local/config.json');
const Logger = require('./logger.js');

class nhay {
    getLineCount() {
        const filePath = config.curse_file || '';
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n');
            return lines.length;
        } catch (err) {
            Logger.error(`Error reading file from disk: ${err}`);
            return 0;
        }
    }

    randomize() {
        const filePath = config.curse_file || '';
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n');
            var lineCount = lines.length;
        } catch (err) {
            Logger.error(`Error reading file from disk: ${err}`);
            return 0;
        }
        const randomNumber = Math.floor(Math.random() * lineCount) + 1;
        return randomNumber;
    }

    readLine(lineNumber) {
        const filePath = config.curse_file || '';
        const data = fs.readFileSync(filePath, "utf8");
        const lines = data.split(/\r?\n/);
        return lines[lineNumber - 1];
    }

    readRandomLine() {
        const filePath = config.curse_file || '';
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const lines = data.split('\n');
            var lineCount = lines.length;
        } catch (err) {
            Logger.error(`Error reading file from disk: ${err}`);
            return 0;
        }
        const randomNumber = Math.floor(Math.random() * lineCount) + 1;
        return this.readLine(randomNumber);
    }
}

module.exports = nhay;