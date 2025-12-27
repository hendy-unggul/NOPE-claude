import { supabase } from './supabase'

export async function uploadArtefak(file, userId, notation = '') {
  const ext = file.name.split('.').pop()
  const path = `${userId}-${Date.now()}.${ext}`

  // 1. Upload file
  const { error: upErr } = await supabase.storage
    .from('artefak')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (upErr) throw upErr

  // 2. Public URL
  const { data: urlData } = supabase.storage
    .from('artefak')
    .getPublicUrl(path)

  // 3. Insert row
  const { data, error } = await supabase
    .from('artefak')
    .insert({ user_id: userId, image_url: urlData.publicUrl, content: notation })
    .select()
    .single()
  if (error) throw error

  return data
}

export async function fetchArtefak(userId, limit = 6) {
  const { data, error } = await supabase
    .from('artefak')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function updateArtefakNotation(id, content) {
  const { error } = await supabase
    .from('artefak')
    .update({ content })
    .eq('id', id)
  if (error) throw error
}
