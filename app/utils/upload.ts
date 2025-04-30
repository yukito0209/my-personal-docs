import { SFTP_CONFIG } from './oss';
import { Client } from 'ssh2';
import { Stats } from 'fs';

export async function uploadFile(
  localPath: string,
  remotePath: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }

        const readStream = require('fs').createReadStream(localPath);
        const writeStream = sftp.createWriteStream(remotePath);

        let uploadedBytes = 0;
        const totalBytes = (require('fs').statSync(localPath) as Stats).size;

        readStream.on('data', (chunk: Buffer) => {
          uploadedBytes += chunk.length;
          if (onProgress) {
            onProgress((uploadedBytes / totalBytes) * 100);
          }
        });

        writeStream.on('close', () => {
          conn.end();
          resolve();
        });

        writeStream.on('error', (err: Error) => {
          conn.end();
          reject(err);
        });

        readStream.pipe(writeStream);
      });
    });

    conn.on('error', (err: Error) => {
      reject(err);
    });

    conn.connect({
      host: SFTP_CONFIG.host,
      port: SFTP_CONFIG.port,
      username: SFTP_CONFIG.username,
      password: SFTP_CONFIG.password
    });
  });
}

export async function uploadPhoto(localPath: string, filename: string): Promise<string> {
  const remotePath = `/photos/gallery/${filename}`;
  await uploadFile(localPath, remotePath);
  return filename;
}

export async function uploadMusic(localPath: string, filename: string): Promise<string> {
  const remotePath = `/music/albums/${filename}`;
  await uploadFile(localPath, remotePath);
  return filename;
}

export async function uploadLogo(localPath: string, filename: string): Promise<string> {
  const remotePath = `/logos/${filename}`;
  await uploadFile(localPath, remotePath);
  return filename;
} 