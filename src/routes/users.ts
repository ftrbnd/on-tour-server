import { FastifyPluginAsyncZod } from '@benjaminlindberg/fastify-type-provider-zod';
import { deletePlaylist, getUser, getUserPlaylists, storePlaylist } from '../controllers/users';
import { z } from 'zod';

const playlistResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  setlistId: z.string(),
  title: z.string()
});

export const userRoutes: FastifyPluginAsyncZod = async function (server) {
  server.post(
    '/:id/playlists',
    {
      schema: {
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          playlistId: z.string(),
          title: z.string(),
          setlistId: z.string()
        }),
        response: {
          200: z.object({
            playlist: playlistResponseSchema
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
        querystring: z.object({
          setlistId: z.string().optional()
        }),
        response: {
          200: z.object({
            playlists: z.array(playlistResponseSchema)
          })
        }
      }
    },
    getUserPlaylists
  );

  server.delete(
    '/:id/playlists/:playlistId',
    {
      schema: {
        params: z.object({
          id: z.string(),
          playlistId: z.string()
        })
      }
    },
    deletePlaylist
  );

  server.get('/:id', getUser);
};
