import { eq, and } from 'drizzle-orm';
import { db } from '../db/drizzle';
import { NewUpcomingShow, playlists, upcomingShows, users } from '../db/schema';
import { generateId } from 'lucia';

export const insertPlaylist = async (userId: string, playlistId: string, setlistId: string, title: string) => {
  const newPlaylists = await db
    .insert(playlists)
    .values({
      id: playlistId,
      userId: userId,
      setlistId,
      title
    })
    .returning();

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

export const insertUpcomingShow = async (upcomingShow: NewUpcomingShow) => {
  const id = generateId(15);

  const newUpcomingShows = await db
    .insert(upcomingShows)
    .values({
      id,
      userId: upcomingShow.userId,
      artist: upcomingShow.artist,
      tour: upcomingShow.tour,
      venue: upcomingShow.venue,
      city: upcomingShow.city,
      date: upcomingShow.date
    })
    .returning();

  return newUpcomingShows[0];
};

export const selectUserUpcomingShows = async (userId: string) => {
  const upcomingShowsFound = await db.select().from(upcomingShows).where(eq(upcomingShows.userId, userId));

  return upcomingShowsFound;
};

export const findUserById = async (id: string) => {
  const usersFound = await db.select().from(users).limit(1).where(eq(users.id, id));

  if (usersFound.length === 1) return usersFound[0];
};
