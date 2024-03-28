import { eq, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { playlists, users } from '../db/schema';

export const createPlaylist = async (userId: string, playlistId: string) => {
  const newPlaylists = await db
    .insert(playlists)
    .values({
      id: playlistId,
      userId: userId
    })
    .returning();

  return newPlaylists[0];
};

export const getPlaylistsFromUser = async (userId: string) => {
  const playlistsFound = await db.select().from(playlists).where(eq(playlists.userId, userId));

  return playlistsFound;
};

export const findUserById = async (id: string) => {
  const usersFound = await db.select().from(users).limit(1).where(eq(users.id, id));

  if (usersFound.length === 1) return usersFound[0];
};
