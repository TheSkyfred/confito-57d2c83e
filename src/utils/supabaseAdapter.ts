
// Track product clicks
export const trackProductClick = async (productId: string, articleId: string) => {
  try {
    const { data: userResponse } = await supabase.auth.getUser();
    const user = userResponse?.user;
    
    const clickData = {
      product_id: productId,
      article_id: articleId,
      user_id: user?.id || null,
      user_agent: navigator.userAgent,
    };
    
    // Record the click
    await supabase.from('advice_product_clicks').insert(clickData);
    
    // Fetch current click count
    const { data: productData } = await supabase
      .from('advice_products')
      .select('click_count')
      .eq('id', productId)
      .single();
      
    const currentClicks = productData?.click_count || 0;
    
    // Update the click count directly
    await supabase
      .from('advice_products')
      .update({ click_count: currentClicks + 1 })
      .eq('id', productId);
      
    return true;
  } catch (error) {
    console.error('Error tracking product click:', error);
    return false;
  }
};
