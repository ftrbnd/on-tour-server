import { FastifyPluginAsyncZod } from '@benjaminlindberg/fastify-type-provider-zod';
import { createUpcomingShow, deletePlaylist, getUserUpcomingShows, getUser, getUserPlaylists, createPlaylist } from '../controllers/users';
import { z } from 'zod';
import { playlistSelectSchema, upcomingShowInsertSchema, upcomingShowSelectSchema } from '../db/schema';

// TODO: create schemas with drizzle-zod
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

  server.get('/:id', getUser);
};
