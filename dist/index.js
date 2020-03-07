"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const events_1 = require("events");
const timeRegex = /\S+/;
class FFplay extends events_1.EventEmitter {
    constructor(file, opts = []) {
        super();
        this.proc = null;
        this.currentTime = 0;
        this.running = false;
        this.manualStop = false;
        this.paused = false;
        opts = ['-stats', '-nodisp', '-genpts', '-autoexit', '-vn'].concat(opts);
        opts.unshift(file);
        this.proc = child_process_1.spawn('ffplay', opts, { stdio: ['ignore', 'ignore', 'pipe'] });
        this.proc.stderr.on('data', (data) => {
            data = data.toString();
            const arr = data.match(timeRegex);
            if (arr && arr.length && !isNaN(arr[0])) {
                this.currentTime = arr[0];
            }
        });
        process.on('exit', () => {
            this.proc.kill();
        });
        this.proc.on('exit', () => {
            if (this.running) {
                this.running = false;
                process.removeListener('exit', () => {
                    this.proc.kill();
                });
                if (!this.manualStop) {
                    setImmediate(() => {
                        this.emit('stopped');
                    });
                }
            }
        });
        this.running = true;
    }
    pause() {
        if (!this.paused) {
            this.proc.kill('SIGSTOP');
            this.paused = true;
            this.emit('paused');
        }
    }
    resume() {
        if (this.paused) {
            this.proc.kill('SIGCONT');
            this.paused = false;
            this.emit('resumed');
        }
    }
    stop() {
        this.manualStop = true;
        this.proc.kill('SIGKILL');
    }
}
exports.default = FFplay;
//# sourceMappingURL=index.js.map