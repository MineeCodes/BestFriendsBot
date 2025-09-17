const chalk = require("chalk");

class Logger {
    static info(...messages) {
        const time = new Date().toISOString();
        console.log(`${chalk.gray(`[${time}]`)} ${chalk.blue("[INFO]")} ${messages.join(' ')}`);
    }

    static warn(...messages) {
        const time = new Date().toISOString();
        console.warn(`${chalk.gray(`[${time}]`)} ${chalk.yellow("[WARN]")} ${messages.join(' ')}`);
    }

    static error(...messages) {
        const time = new Date().toISOString();
        console.error(`${chalk.gray(`[${time}]`)} ${chalk.red("[ERROR]")} ${messages.join(' ')}`);
    }

    static debug(...messages) {
        if (process.env.DEBUG === "true") {
            const time = new Date().toISOString();
            console.log(`${chalk.gray(`[${time}]`)} ${chalk.magenta("[DEBUG]")} ${messages.join(' ')}`);
        }
    }

    static progress(...messages) {
        const time = new Date().toISOString();
        console.log(`${chalk.gray(`[${time}]`)} ${chalk.green("[PROGRESS]")} ${messages.join(' ')}`);
    }
}

module.exports = Logger;
