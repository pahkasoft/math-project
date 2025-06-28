
const getTicks = () => new Date().getTime();

export class StopWatch {
    private startTime: number = 0;
    private stopTime: number = 0;

    start() {
        this.startTime = this.stopTime = getTicks();
    }

    stop() {
        this.stopTime = getTicks();
    }

    getDurationMs() {
        return this.stopTime - this.startTime;
    }

    getIntervalMs() {
        return getTicks() - this.startTime;
    }
}