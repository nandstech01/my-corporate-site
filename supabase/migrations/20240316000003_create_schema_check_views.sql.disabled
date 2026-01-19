-- Create a view for table structure analysis
CREATE OR REPLACE VIEW public.schema_analysis AS
WITH table_info AS (
    SELECT
        c.table_name,
        c.column_name,
        c.data_type,
        c.character_maximum_length,
        c.column_default,
        c.is_nullable,
        c.ordinal_position,
        tc.constraint_type,
        kcu.constraint_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM
        information_schema.columns c
        LEFT JOIN information_schema.table_constraints tc
            ON tc.table_name = c.table_name
            AND tc.table_schema = c.table_schema
        LEFT JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
            AND kcu.column_name = c.column_name
        LEFT JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
    WHERE
        c.table_schema = 'public'
        AND c.table_name IN ('businesses', 'categories', 'chatgpt_posts', 'analytics')
)
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    ordinal_position,
    string_agg(DISTINCT constraint_type, ', ') as constraints,
    string_agg(DISTINCT foreign_table_name || '.' || foreign_column_name, ', ') as foreign_key_references
FROM
    table_info
GROUP BY
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    ordinal_position
ORDER BY
    table_name,
    ordinal_position;

-- Create a view for index analysis
CREATE OR REPLACE VIEW public.index_analysis AS
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
    AND tablename IN ('businesses', 'categories', 'chatgpt_posts', 'analytics'); 