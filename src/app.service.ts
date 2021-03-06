import { Injectable } from '@nestjs/common';
import { EncryptionDto } from './dtos/encrypt.dto';
import * as crypto from 'crypto';
import { EncryptionInterface } from './interfaces/encryption.interface';

@Injectable()
export class AppService {
  private masterKey = '3d8d9853081e12ac2a500028dc118af1206e3ba37a1cd7c1ed03ad6362510cf4be4120062a832f344325d1417b8e16eb0c5be9a4520f7f4c82994a80436ceea4';

  encrypt(text: string):EncryptionInterface{
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(64);
    const key = crypto.pbkdf2Sync(this.masterKey,salt, 2145, 32, 'sha512');
    const cipher = crypto.createCipheriv('aes-256-gcm', key,iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf-8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const response: EncryptionInterface = {
      text: Buffer.concat([salt, iv, tag, encrypted]).toString('base64'),
    };

    return response;
  }

  decrypt(textData:string): EncryptionInterface{
      const bData = Buffer.from(textData, 'base64');

      const salt = bData.slice(0, 64);
      const iv = bData.slice(64, 80);
      const tag = bData.slice(80, 96);
      const text = bData.slice(96);
      const key = crypto.pbkdf2Sync(this.masterKey, salt, 2145, 32, 'sha512');

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);

      const decryptedText = decipher.update(text) + decipher.final('utf-8');
      const response: EncryptionInterface = {
        text: decryptedText,
      };

      return response;

  }

}
