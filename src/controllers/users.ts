import { FastifyReply, FastifyRequest } from 'fastify';
import { createPlaylist, findUserById, getPlaylistsFromUser } from '../services/users';

export const storePlaylist = async (request: FastifyRequest<{ Params: { id: string }; Body: { playlistId: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;
  const { playlistId } = request.body;

  const playlist = await createPlaylist(id, playlistId);

  return reply.status(200).send({ playlist });
};

export const getUserPlaylists = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;

  const playlists = await getPlaylistsFromUser(id);

  return reply.status(200).send({ playlists });
};

export const getUser = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  if (!request.session) {
    return reply.status(401).send({ error: 'Invalid session' });
  }

  const { id } = request.params;

  const user = await findUserById(id);

  return reply.status(200).send({ user });
};
