import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// Client-side singleton instance
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');