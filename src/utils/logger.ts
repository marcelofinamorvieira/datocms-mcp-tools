import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, 'server.log');

function format(level: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaString = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()} ${message}${metaString}`;
}

function write(line: string): void {
  fs.appendFileSync(logFile, line + '\n', 'utf8');
}

export const logger = {
  info(message: string, meta?: unknown): void {
    const line = format('info', message, meta);
    console.log(line);
    write(line);
  },
  warn(message: string, meta?: unknown): void {
    const line = format('warn', message, meta);
    console.warn(line);
    write(line);
  },
  error(message: string, meta?: unknown): void {
    const line = format('error', message, meta);
    console.error(line);
    write(line);
  },
};

export default logger;
