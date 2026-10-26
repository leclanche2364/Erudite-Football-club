import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseForRequest } from '../lib/supabase-server';

const env = () => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Application submissions are not available yet. Please contact the academy directly.' });
  return { url, key };
};

const pathway = z.enum(['residency', 'u10', 'u12', 'u14', 'u16']);
const applicationInput = z.object({
  player_name: z.string().trim().min(2).max(100),
  pathway,
  academic_level: z.string().trim().min(2).max(120),
  primary_position: z.enum(['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Still exploring']),
  guardian_name: z.string().trim().min(2).max(100),
  guardian_phone: z.string().trim().min(7).max(30).regex(/^[+()\d\s.-]+$/),
  message: z.string().trim().max(1000).optional(),
  conduct_acknowledged: z.literal('true'),
  medical_policy_acknowledged: z.literal('true'),
  website: z.string().optional(),
});

const statusInput = z.object({ id: z.uuid(), status: z.enum(['new', 'reviewing', 'contacted', 'closed']) });

export const server = {
  submitApplication: defineAction({
    accept: 'form',
    input: applicationInput,
    handler: async (input) => {
      if (input.website) return { success: true };
      const { url, key } = env();
      const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await supabase.from('applications').insert({
        player_name: input.player_name,
        pathway: input.pathway,
        academic_level: input.academic_level,
        primary_position: input.primary_position,
        guardian_name: input.guardian_name,
        guardian_phone: input.guardian_phone,
        message: input.message || null,
        conduct_acknowledged: true,
        medical_policy_acknowledged: true,
      });
      if (error) {
        console.error('Application insert failed:', error.code);
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'We could not send the enquiry. Please try again or contact the academy.' });
      }
      return { success: true };
    },
  }),
  staffLogin: defineAction({
    accept: 'form',
    input: z.object({ email: z.email(), password: z.string().min(1) }),
    handler: async (input, context) => {
      const supabase = supabaseForRequest(context.request, context.cookies);
      if (!supabase) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Staff sign in is not configured yet.' });
      const { error } = await supabase.auth.signInWithPassword(input);
      if (error) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Email or password is incorrect. Check your details and try again.' });
      return { success: true };
    },
  }),
  staffLogout: defineAction({
    accept: 'form',
    input: z.object({}),
    handler: async (_input, context) => {
      const supabase = supabaseForRequest(context.request, context.cookies);
      if (!supabase) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Staff sign in is not configured yet.' });
      await supabase.auth.signOut();
      return { success: true };
    },
  }),
  updateApplicationStatus: defineAction({
    accept: 'form',
    input: statusInput,
    handler: async ({ id, status }, context) => {
      const supabase = supabaseForRequest(context.request, context.cookies);
      if (!supabase) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Staff sign in is not configured yet.' });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new ActionError({ code: 'UNAUTHORIZED', message: 'Sign in to update an application.' });
      const { error } = await supabase.from('applications').update({ status }).eq('id', id);
      if (error) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'The status could not be saved. Please try again.' });
      return { success: true };
    },
  }),
};
