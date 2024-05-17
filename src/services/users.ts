import { eq, and } from 'drizzle-orm';
import { db } from '../db/drizzle.js';
import { NewPlaylist, NewUpcomingShow, UpdatedUpcomingShow, playlists, upcomingShows, users } from '../db/schema.js';
import { generateId } from 'lucia';

export const deleteUserFromDb = async (userId: string) => {
  await db.delete(users).where(eq(users.id, userId));
};

export const insertPlaylist = async (playlist: NewPlaylist) => {
  const newPlaylists = await db.insert(playlists).values(playlist).returning();

  return newPlaylists[0];
};

export const selectUserPlaylists = async (userId: string) => {
  const playlistsFound = await db.select().from(playlists).where(eq(playlists.userId, userId));

  return playlistsFound;
};

export const selectPlaylistsBySetlist = async (setlistId: string, userId: string) => {
  const playlistsFound = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.setlistId, setlistId), eq(playlists.userId, userId)));

  return playlistsFound;
};

export const deletePlaylistFromUser = async (playlistId: string, userId: string) => {
  await db.delete(playlists).where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));
};

export const insertUpcomingShow = async (show: NewUpcomingShow) => {
  const id = generateId(15);

  const newUpcomingShows = await db
    .insert(upcomingShows)
    .values({
      id,
      ...show
    })
    .returning();

  return newUpcomingShows[0];
};

export const selectUserUpcomingShows = async (userId: string) => {
  const upcomingShowsFound = await db.select().from(upcomingShows).orderBy(upcomingShows.date).where(eq(upcomingShows.userId, userId));

  return upcomingShowsFound;
};

export const updateUserUpcomingShow = async (id: string, userId: string, show: UpdatedUpcomingShow) => {
  const updatedUpcomingShows = await db
    .update(upcomingShows)
    .set(show)
    .where(and(eq(upcomingShows.id, id), eq(upcomingShows.userId, userId)))
    .returning();

  return updatedUpcomingShows[0];
};

export const deleteUpcomingShowFromUser = async (id: string, userId: string) => {
  await db.delete(upcomingShows).where(and(eq(upcomingShows.id, id), eq(upcomingShows.userId, userId)));
};
