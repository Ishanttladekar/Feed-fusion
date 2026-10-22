import { SocialPlatform } from '../../types';
import { SocialAdapter } from './BaseAdapter';
import { MockAdapter } from './MockAdapter';
import { XAdapter } from './XAdapter';
import { InstagramAdapter } from './InstagramAdapter';
import { FacebookAdapter } from './FacebookAdapter';

export function getAdapter(platform: SocialPlatform, isMock: boolean): SocialAdapter {
  if (isMock) {
    return new MockAdapter(platform);
  }

  switch (platform) {
    case 'twitter':
      return new XAdapter();
    case 'instagram':
      return new InstagramAdapter();
    case 'facebook':
      return new FacebookAdapter();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export * from './BaseAdapter';
export * from './MockAdapter';
export * from './XAdapter';
export * from './InstagramAdapter';
export * from './FacebookAdapter';
