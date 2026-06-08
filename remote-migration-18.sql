-- Clean up duplicate and misconfigured community categories
DELETE FROM post_categories 
WHERE type = 'community' 
  AND name NOT IN ('free', 'match', 'picks', 'events');
