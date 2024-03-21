import { eq } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { accounts, users } from '../db/schema';
import { SpotifyTokens } from 'arctic';
import { generateId } from 'lucia';

interface SpotifyUser {
  display_name?: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  images: {
    url: string;
    height?: number;
    width?: number;
  }[];
  type: 'user';
  uri: `spotify:user:${SpotifyUser['id']}`;
  followers: { href: null; total: number };
}

export const createUserFromSpotify = async (user: SpotifyUser) => {
  const userId = generateId(15);

  const newUser = await db
    .insert(users)
    .values({
      id: userId,
      avatar: user.images[1].url,
      displayName: user.display_name
    })
    .returning();

  return newUser[0];
};

export const createAccount = async (userId: string, spotifyId: string, tokens: SpotifyTokens) => {
  const accountId = generateId(15);

  const newAccount = await db
    .insert(accounts)
    .values({
      id: accountId,
      userId: userId,
      provider: 'spotify',
      providerId: spotifyId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt
    })
    .returning();

  return newAccount;
};

export const findAccountByUserId = async (userId: string) => {
  const accountsFound = await db.select().from(accounts).limit(1).where(eq(accounts.userId, userId));

  if (accountsFound.length === 1) return accountsFound[0];
};

export const findAccountByProviderId = async (providerId: string) => {
  const accountsFound = await db.select().from(accounts).limit(1).where(eq(accounts.providerId, providerId));

  if (accountsFound.length === 1) return accountsFound[0];
};

export const getSpotifyUser = async (accessToken: string) => {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error('Failed to get user details from Spotify');

  const user: SpotifyUser = await res.json();
  return user;
};

export const updateAccountTokensByUserId = async (userId: string, tokens: SpotifyTokens) => {
  const updatedAccounts = await db
    .update(accounts)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt
    })
    .where(eq(accounts.userId, userId))
    .returning();

  if (updatedAccounts.length === 1) return updatedAccounts[0];
};
