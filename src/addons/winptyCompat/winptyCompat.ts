/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

export function apply(terminalConstructor) {
  terminalConstructor.prototype.winptyCompatInit = function(): void {
    // Don't do anything when the platform is not Windows
    const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0;
    if (!isWindows) {
      return;
    }

    // Winpty does not support wraparound mode which means that lines will never
    // be marked as wrapped. This causes issues for things like copying a line
    // retaining the wrapped new line characters or if consumers are listening
    // in on the data stream.
    //
    // The workaround for this is to listen to every incoming line feed and mark
    // the line as wrapped if the last character in the previous line is not a
    // space. This is certainly not without its problems, but generally on
    // Windows when text reaches the end of the terminal it's likely going to be
    // wrapped.
    this.on('lineFeed', () => {
      const line = this.buffer.lines.get(this.buffer.ybase + this.buffer.y - 1);
      const lastChar = line[this.cols - 1];
      if (lastChar[3] !== 32 /* ' ' */) {
        const nextLine = this.buffer.lines.get(this.buffer.ybase + this.buffer.y);
        (<any>nextLine).isWrapped = true;
      }
    });
  };
}
