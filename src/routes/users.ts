import { FastifyPluginAsyncZod } from '@benjaminlindberg/fastify-type-provider-zod';
import { createUpcomingShow, deletePlaylist, getUserUpcomingShows, getUserPlaylists, createPlaylist, updateUpcomingShow, deleteUpcomingShow } from '../controllers/users';
import { z } from 'zod';
import { playlistInsertSchema, playlistSelectSchema, upcomingShowInsertSchema, upcomingShowSelectSchema, upcomingShowUpdateSchema } from '../db/schema';

export const userRoutes: FastifyPluginAsyncZod = async function (server) {
  server.post(
    '/:id/playlists',
    {
      schema: {
        params: z.object({
          id: z.string()
        }),
        body: z.object({
          playlist: playlistInsertSchema
        }),
        response: {
          200: z.object({
            playlist: playlistSelectSchema
          }),
          401: z.object({
            error: z.string()
          })
        }
      }
    },
    createPlaylist
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
            playlists: z.array(playlistSelectSchema)
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

  server.post(
    '/:id/upcoming',
    {
      schema: {
        body: z.object({
          upcomingShow: upcomingShowInsertSchema
        }),
        response: {
          200: z.object({
            upcomingShow: upcomingShowSelectSchema
          })
        }
      }
    },
    createUpcomingShow
  );
  server.get(
    '/:id/upcoming',
    {
      schema: {
        response: {
          200: z.object({
            upcomingShows: z.array(upcomingShowSelectSchema)
          })
        }
      }
    },
    getUserUpcomingShows
  );
  server.patch(
    '/:id/upcoming/:upcomingId',
    {
      schema: {
        params: z.object({
          id: z.string(),
          upcomingId: z.string()
        }),
        body: z.object({
          upcomingShow: upcomingShowUpdateSchema
        }),
        response: {
          200: z.object({
            upcomingShow: upcomingShowSelectSchema
          })
        }
      }
    },
    updateUpcomingShow
  );
  server.delete(
    '/:id/upcoming/:upcomingId',
    {
      schema: {
        params: z.object({
          id: z.string(),
          upcomingId: z.string()
        })
      }
    },
    deleteUpcomingShow
  );
};
