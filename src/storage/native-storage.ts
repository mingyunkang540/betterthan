import { Storage } from '@apps-in-toss/native-modules';
import type { StorageDriver } from './record-storage';

export const nativeStorage: StorageDriver = Storage;
