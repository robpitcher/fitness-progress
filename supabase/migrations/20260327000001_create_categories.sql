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

-- 5. Keep the old category column for now (we'll deprecate it later)
-- This maintains backward compatibility during transition
-- Future exercises will use category_id instead
