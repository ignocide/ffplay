import { spawn, ChildProcess } from 'child_process';
import * as util from 'util';
import { EventEmitter } from 'events';
const timeRegex = /\S+/;

class FFplay extends EventEmitter {
  proc?: ChildProcess = null;
  currentTime: number = 0;
  running: boolean = false;
  manualStop: boolean = false;
  paused: boolean = false;
  constructor(file, opts: string[] = []) {
    super();
    opts = [ '-stats', '-nodisp', '-genpts', '-autoexit', '-vn' ].concat(opts);
    opts.unshift(file);

    this.proc = spawn('ffplay', opts, { stdio: [ 'ignore', 'ignore', 'pipe' ] });
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

export default FFplay;
