import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
declare class FFplay extends EventEmitter {
    proc?: ChildProcess;
    currentTime: number;
    running: boolean;
    manualStop: boolean;
    paused: boolean;
    constructor(file: any, opts?: string[]);
    pause(): void;
    resume(): void;
    stop(): void;
}
export default FFplay;
