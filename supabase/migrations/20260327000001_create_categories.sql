-- Migration: Add categories table and update exercises
-- This migration creates a categories table with default categories
-- and prepares for migrating free-text categories to references

-- 1. Create categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint categories_user_name_unique unique (user_id, name)
);

-- Partial unique indexes for case-insensitive uniqueness
-- Prevents duplicate NULL user_id defaults (PostgreSQL treats NULLs as distinct in unique constraints)
create unique index categories_default_name_unique
  on categories (lower(name)) where user_id is null;

-- Prevents case-variant duplicates per user (e.g. 'Chest' vs 'chest')
create unique index categories_user_name_unique_ci
  on categories (user_id, lower(name)) where user_id is not null;

-- 2. Seed default categories (user_id IS NULL for system defaults)
insert into categories (name, user_id) values
  ('Chest', null),
  ('Back', null),
  ('Shoulders', null),
  ('Legs', null),
  ('Arms', null),
  ('Core', null);

-- 3. Add category_id column to exercises (nullable for backward compatibility)
alter table exercises add column category_id uuid references categories (id) on delete set null;

-- 4. Migrate existing free-text categories to category references
-- This creates user-specific categories for any unique category text per user
do $$
declare
  rec record;
  cat_id uuid;
begin
  -- For each unique (user_id, category) pair where category is not null
  for rec in
    select distinct user_id, category
    from exercises
    where category is not null and trim(category) != ''
  loop
    -- Try to find a matching default category (case-insensitive)
    select id into cat_id
    from categories
    where user_id is null
      and lower(trim(name)) = lower(trim(rec.category))
    limit 1;

    -- If no default match, create a user-specific category
    if cat_id is null then
      insert into categories (name, user_id)
      values (trim(rec.category), rec.user_id)
      on conflict (user_id, name) do nothing
      returning id into cat_id;

      -- If conflict occurred, fetch the existing id
      if cat_id is null then
        select id into cat_id
        from categories
        where (user_id = rec.user_id or (user_id is null and rec.user_id is null))
          and name = trim(rec.category);
      end if;
    end if;

    -- Update exercises to reference the category
    update exercises
    set category_id = cat_id
    where (user_id = rec.user_id or (user_id is null and rec.user_id is null))
      and category = rec.category;
  end loop;
end $$;

-- 5. Create a function to sync category name when category_id changes
create or replace function sync_exercise_category()
returns trigger as $$
begin
  -- If category_id is set, update category text from the categories table
  if new.category_id is not null then
    select name into new.category
    from categories
    where id = new.category_id;
  else
    -- If category_id is null, keep category as is (allows manual text)
    new.category := new.category;
  end if;
  return new;
end;
$$ language plpgsql;

-- 6. Create trigger to keep category text in sync with category_id
create trigger sync_exercise_category_trigger
  before insert or update of category_id
  on exercises
  for each row
  execute function sync_exercise_category();

-- 7. Update all existing exercises to sync their category text
update exercises
set category = categories.name
from categories
where exercises.category_id = categories.id;

