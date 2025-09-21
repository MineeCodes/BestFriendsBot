const chalk = require("chalk");

class Logger {
    constructor(name="Unknown") {
        this.name = name;
    }

    info(...messages) {
        const time = new Date().toISOString();
        console.log(`${chalk.gray(`[${time}]`)} ${chalk.cyan(`[${this.name}]`)} ${chalk.blue("[INFO]")} ${messages.join(' ')}`);
    }

    warn(...messages) {
        const time = new Date().toISOString();
        console.warn(`${chalk.gray(`[${time}]`)} ${chalk.cyan(`[${this.name}]`)} ${chalk.yellow("[WARN]")} ${messages.join(' ')}`);
    }

    error(...messages) {
        const time = new Date().toISOString();
        console.error(`${chalk.gray(`[${time}]`)} ${chalk.cyan(`[${this.name}]`)} ${chalk.red("[ERROR]")} ${messages.join(' ')}`);
    }

    debug(...messages) {
        if (process.env.DEBUG === "true") {
            const time = new Date().toISOString();
            console.log(`${chalk.gray(`[${time}]`)} ${chalk.cyan(`[${this.name}]`)} ${chalk.magenta("[DEBUG]")} ${messages.join(' ')}`);
        }
    }

    progress(...messages) {
        const time = new Date().toISOString();
        console.log(`${chalk.gray(`[${time}]`)} ${chalk.cyan(`[${this.name}]`)} ${chalk.green("[PROGRESS]")} ${messages.join(' ')}`);
    }
}

module.exports = Logger;
