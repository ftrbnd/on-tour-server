import { FastifyReply, FastifyRequest } from 'fastify';
import {
  insertPlaylist,
  deletePlaylistFromUser,
  selectPlaylistsBySetlist,
  selectUserPlaylists,
  selectUserUpcomingShows,
  insertUpcomingShow,
  updateUserUpcomingShow,
  deleteUpcomingShowFromUser,
  deleteUserFromDb
} from '../services/users.js';
import { NewPlaylist, NewUpcomingShow, UpdatedUpcomingShow } from '../db/schema.js';

export const deleteUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;

  await deleteUserFromDb(id);

  return reply.status(204).send();
};

export const createPlaylist = async (request: FastifyRequest<{ Params: { id: string }; Body: { playlist: NewPlaylist } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { playlist } = request.body;

  const newPlaylist = await insertPlaylist(playlist);

  return reply.status(200).send({ playlist: newPlaylist });
};

export const getUserPlaylists = async (request: FastifyRequest<{ Params: { id: string }; Querystring: { setlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;
  const { setlistId } = request.query;

  const playlists = setlistId ? await selectPlaylistsBySetlist(setlistId, id) : await selectUserPlaylists(id);

  return reply.status(200).send({ playlists });
};

export const deletePlaylist = async (request: FastifyRequest<{ Params: { id: string; playlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id, playlistId } = request.params;

  await deletePlaylistFromUser(playlistId, id);

  return reply.status(204).send();
};

export const createUpcomingShow = async (request: FastifyRequest<{ Params: { id: string }; Body: { upcomingShow: NewUpcomingShow } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { upcomingShow } = request.body;

  const newUpcomingShow = await insertUpcomingShow(upcomingShow);

  return reply.status(200).send({ upcomingShow: newUpcomingShow });
};

export const getUserUpcomingShows = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;

  const upcomingShows = await selectUserUpcomingShows(id);

  return reply.status(200).send({ upcomingShows });
};

export const updateUpcomingShow = async (request: FastifyRequest<{ Params: { id: string; upcomingId: string }; Body: { upcomingShow: UpdatedUpcomingShow } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id, upcomingId } = request.params;
  const { upcomingShow } = request.body;

  const updatedUpcomingShow = await updateUserUpcomingShow(upcomingId, id, upcomingShow);

  return reply.status(200).send({ upcomingShow: updatedUpcomingShow });
};

export const deleteUpcomingShow = async (request: FastifyRequest<{ Params: { id: string; upcomingId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id, upcomingId } = request.params;

  await deleteUpcomingShowFromUser(upcomingId, id);

  return reply.status(204).send();
};
