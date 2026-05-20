-- Fix corrupted rating_distribution data in PostgreSQL
-- The backslash escapes from MySQL dump were stored literally in PostgreSQL
-- This script cleans the data so RatingDistributionConverter can parse it

-- Option 1: Quick fix - replace all backslash-escaped quotes with regular quotes
UPDATE product_stats 
SET rating_distribution = REPLACE(rating_distribution, '\"', '"')
WHERE rating_distribution LIKE '%\"%';

-- Verify the fix
SELECT product_id, rating_distribution FROM product_stats LIMIT 5;
