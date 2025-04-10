
// Fix TypeScript error in the component for image upload
// Update the RPC function call inside the handleSubmit function:

// Inside handleSubmit function, in the image upload section:
// Use RPC function to insert image reference, bypassing RLS
const { error: imageInsertError } = await supabase.rpc('insert_jam_image', {
  p_jam_id: jam_id,
  p_url: publicUrl.publicUrl,
  p_is_primary: isMainImage,
  p_creator_id: isEditMode ? jamCreatorId : user.id
} as any); // Add type assertion to avoid TypeScript error
