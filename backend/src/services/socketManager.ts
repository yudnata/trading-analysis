import type { Server } from 'socket.io';

/**
 * Socket.io instance registry — menghindari circular dependency.
 *
 * index.ts memanggil `setIO(io)` setelah create,
 * job/worker cukup `import { getIO } from './socketManager'`.
 */
let _io: Server | null = null;

export function setIO(io: Server): void {
  _io = io;
}

export function getIO(): Server {
  if (!_io) {
    throw new Error('[socketManager] Socket.io belum diinisialisasi — pastikan setIO() dipanggil di index.ts');
  }
  return _io;
}
