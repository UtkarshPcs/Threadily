import { encrypt, decrypt } from '@/lib/security/encryption';

const THREADS_API_BASE = 'https://graph.threads.net/v1.0';

interface ThreadsTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ThreadsPublishResponse {
  id: string;
}

export class ThreadsClient {
  private accessToken: string;

  constructor(encryptedToken: string) {
    this.accessToken = decrypt(encryptedToken);
  }

  static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.THREADS_APP_ID!,
      redirect_uri: process.env.THREADS_REDIRECT_URI!,
      scope: 'threads_basic,threads_content_publish',
      response_type: 'code',
    });
    return `https://threads.net/oauth/authorize?${params}`;
  }

  static async exchangeCode(code: string): Promise<{ accessToken: string; expiresIn: number }> {
    const res = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.THREADS_APP_ID!,
        client_secret: process.env.THREADS_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.THREADS_REDIRECT_URI!,
        code,
      }),
    });

    if (!res.ok) throw new Error('Failed to exchange code');
    const data: ThreadsTokenResponse = await res.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  static async refreshToken(encryptedToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const token = decrypt(encryptedToken);
    const res = await fetch(`${THREADS_API_BASE}/refresh_access_token?grant_type=th_refresh_token&access_token=${token}`);
    if (!res.ok) throw new Error('Failed to refresh token');
    const data: ThreadsTokenResponse = await res.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
  }

  static encryptToken(token: string): string {
    return encrypt(token);
  }

  async getUserProfile() {
    const res = await fetch(`${THREADS_API_BASE}/me?fields=id,username,name,threads_profile_picture_url&access_token=${this.accessToken}`);
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json();
  }

  /**
   * Publish a thread chain. Threads API requires creating containers first, then publishing.
   */
  async publishThread(blocks: { content: string }[]): Promise<string[]> {
    const userId = (await this.getUserProfile()).id;
    const postIds: string[] = [];
    let replyToId: string | undefined;

    for (const block of blocks) {
      const containerId = await this.createContainer(userId, block.content, replyToId);
      const postId = await this.publishContainer(userId, containerId);
      postIds.push(postId);
      replyToId = postId;
    }

    return postIds;
  }

  private async createContainer(userId: string, text: string, replyToId?: string): Promise<string> {
    const params: Record<string, string> = {
      media_type: 'TEXT',
      text,
      access_token: this.accessToken,
    };
    if (replyToId) params.reply_to_id = replyToId;

    const res = await fetch(`${THREADS_API_BASE}/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to create container');
    }
    const data: ThreadsPublishResponse = await res.json();
    return data.id;
  }

  private async publishContainer(userId: string, containerId: string): Promise<string> {
    const res = await fetch(`${THREADS_API_BASE}/${userId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: this.accessToken,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to publish');
    }
    const data: ThreadsPublishResponse = await res.json();
    return data.id;
  }
}
