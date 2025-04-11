
-- Create functions for user favorites to avoid direct table access

-- Function to check if a jam is favorited by a user
CREATE OR REPLACE FUNCTION check_user_favorite(user_id_param UUID, jam_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM favorites
    WHERE user_id = user_id_param AND jam_id = jam_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a favorite
CREATE OR REPLACE FUNCTION add_user_favorite(user_id_param UUID, jam_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO favorites (user_id, jam_id)
  VALUES (user_id_param, jam_id_param)
  ON CONFLICT (user_id, jam_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a favorite
CREATE OR REPLACE FUNCTION remove_user_favorite(user_id_param UUID, jam_id_param UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM favorites
  WHERE user_id = user_id_param AND jam_id = jam_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment product click count
CREATE OR REPLACE FUNCTION increment_click_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE advice_products
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = row_id
  RETURNING click_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
