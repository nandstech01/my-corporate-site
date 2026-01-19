-- Check existing table structures
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name IN ('businesses', 'categories', 'chatgpt_posts', 'analytics')
ORDER BY 
    table_name,
    ordinal_position; 