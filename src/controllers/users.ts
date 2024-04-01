import { FastifyReply, FastifyRequest } from 'fastify';
import {
  insertPlaylist,
  deletePlaylistFromUser,
  selectPlaylistsBySetlist,
  selectUserPlaylists,
  selectUserUpcomingShows,
  insertUpcomingShow,
  updateUserUpcomingShow,
  deleteUpcomingShowFromUser
} from '../services/users';
import { NewUpcomingShow, UpdatedUpcomingShow } from '../db/schema';

export const createPlaylist = async (request: FastifyRequest<{ Params: { id: string }; Body: { playlistId: string; title: string; setlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;
  const { playlistId, title, setlistId } = request.body;

  const playlist = await insertPlaylist(id, playlistId, setlistId, title);

  return reply.status(200).send({ playlist });
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
