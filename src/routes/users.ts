import { FastifyPluginAsyncZod } from '@benjaminlindberg/fastify-type-provider-zod';
import { getUser, getUserPlaylists, storePlaylist } from '../controllers/users';
import { z } from 'zod';

export const userRoutes: FastifyPluginAsyncZod = async function (server) {
  server.post(
    '/:id/playlists',
    {
      schema: {
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          playlistId: z.string()
        }),
        response: {
          200: z.object({
            playlist: z.object({
              id: z.string(),
              userId: z.string()
            })
          }),
          401: z.object({
            error: z.string()
          })
        }
      }
    },
    storePlaylist
  );
  server.get(
    '/:id/playlists',
    {
      schema: {
        response: {
          200: z.object({
            playlists: z.array(
              z.object({
                id: z.string(),
                userId: z.string()
              })
            )
          })
        }
      }
    },
    getUserPlaylists
  );

  server.get('/:id', getUser);
};
