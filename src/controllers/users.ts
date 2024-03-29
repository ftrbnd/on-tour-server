import { FastifyReply, FastifyRequest } from 'fastify';
import { createPlaylist, deletePlaylistFromUser, findUserById, getPlaylistBySetlist, getPlaylistsFromUser } from '../services/users';

export const storePlaylist = async (request: FastifyRequest<{ Params: { id: string }; Body: { playlistId: string; title: string; setlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;
  const { playlistId, title, setlistId } = request.body;

  const playlist = await createPlaylist(id, playlistId, setlistId, title);

  return reply.status(200).send({ playlist });
};

export const getUserPlaylists = async (request: FastifyRequest<{ Params: { id: string }; Querystring: { setlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;
  const { setlistId } = request.query;

  const playlists = setlistId ? await getPlaylistBySetlist(setlistId, id) : await getPlaylistsFromUser(id);

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

export const getUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;

  const user = await findUserById(id);

  return reply.status(200).send({ user });
};
