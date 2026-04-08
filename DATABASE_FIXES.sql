-- =============================================================================
-- SQL FIX SCRIPT - Tour Booking API Database Schema Corrections
-- =============================================================================
-- This script fixes 3 critical database schema issues found during validation:
--   1. Data type mismatch in coupon_usage.order_id (integer → bigint)
--   2. Missing FK constraint for cart.tour_schedule_id
--   3. Missing FK constraint for coupon_usage.order_id
--
-- Apply this script AFTER fixing the initial schema in initdb.sql
-- Run in: PostgreSQL 16 with tour_service_db database
-- =============================================================================

\c tour_service_db

-- ═════════════════════════════════════════════════════════════════════════════
-- FIX #1: Data Type Mismatch - coupon_usage.order_id
-- ═════════════════════════════════════════════════════════════════════════════
-- Change order_id from integer to bigint to match orders.id type
-- This must be done BEFORE adding the FK constraint

BEGIN TRANSACTION;

-- Step 1: Check current data
-- SELECT * FROM coupon_usage LIMIT 1;

-- Step 2: Alter column type
ALTER TABLE public.coupon_usage
  ALTER COLUMN order_id TYPE bigint USING order_id::bigint;

-- Verify change
-- \d coupon_usage

COMMIT;

-- ═════════════════════════════════════════════════════════════════════════════
-- FIX #2: Add Missing FK Constraint - cart.tour_schedule_id
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.cart
  ADD CONSTRAINT fk_cart_tour_schedule_id FOREIGN KEY (tour_schedule_id)
    REFERENCES public.tour_schedules (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- ═════════════════════════════════════════════════════════════════════════════
-- FIX #3: Add Missing FK Constraint - coupon_usage.order_id
-- ═════════════════════════════════════════════════════════════════════════════
-- This must be done AFTER fixing the data type in FIX #1

ALTER TABLE IF EXISTS public.coupon_usage
  ADD CONSTRAINT fk_coupon_usage_order_id FOREIGN KEY (order_id)
    REFERENCES public.orders (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- ═════════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check if fixes were applied successfully
-- ═════════════════════════════════════════════════════════════════════════════

-- List all foreign keys for cart table
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
  FROM information_schema.key_column_usage
  WHERE table_name = 'cart'
  ORDER BY constraint_name;

-- List all foreign keys for coupon_usage table
SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
  FROM information_schema.key_column_usage
  WHERE table_name = 'coupon_usage'
  ORDER BY constraint_name;

-- Verify coupon_usage.order_id data type
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'coupon_usage' AND column_name = 'order_id';

-- ═════════════════════════════════════════════════════════════════════════════
-- SUCCESS: All 3 critical database issues have been fixed!
-- =============================================================================
