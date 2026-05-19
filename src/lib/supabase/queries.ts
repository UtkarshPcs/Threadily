import { createServerSupabaseClient } from './server';
import { Draft, ThreadBlock } from '@/types';

export async function getDrafts(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('drafts')
    .select('*, thread_blocks(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDraft(draftId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('drafts')
    .select('*, thread_blocks(*)')
    .eq('id', draftId)
    .single();
  if (error) throw error;
  return data;
}

export async function saveDraft(userId: string, draft: { id?: string; title: string; blocks: ThreadBlock[]; tags: string[]; status: string }) {
  const supabase = await createServerSupabaseClient();

  // Upsert draft
  const { data: draftData, error: draftError } = await supabase
    .from('drafts')
    .upsert({ id: draft.id, user_id: userId, title: draft.title, tags: draft.tags, status: draft.status })
    .select()
    .single();
  if (draftError) throw draftError;

  // Delete existing blocks and re-insert
  await supabase.from('thread_blocks').delete().eq('draft_id', draftData.id);
  const blocks = draft.blocks.map(b => ({ draft_id: draftData.id, content: b.content, order: b.order, media_urls: b.media_urls || [] }));
  const { error: blocksError } = await supabase.from('thread_blocks').insert(blocks);
  if (blocksError) throw blocksError;

  // Save version
  await supabase.from('draft_versions').insert({
    draft_id: draftData.id,
    blocks: JSON.stringify(draft.blocks),
    version: (draftData.version || 0) + 1,
  });

  // Increment version
  await supabase.from('drafts').update({ version: (draftData.version || 0) + 1 }).eq('id', draftData.id);

  return draftData;
}

export async function deleteDraft(draftId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('drafts').delete().eq('id', draftId);
  if (error) throw error;
}

export async function getDraftVersions(draftId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('draft_versions')
    .select('*')
    .eq('draft_id', draftId)
    .order('version', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

export async function logActivity(userId: string, action: string, metadata?: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient();
  await supabase.from('activity_logs').insert({ user_id: userId, action, metadata });
}
