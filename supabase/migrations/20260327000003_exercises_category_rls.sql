-- Migration: Add category ownership validation to exercises RLS policies
-- Prevents cross-tenant category references via category_id FK

-- Drop existing INSERT and UPDATE policies that lack category_id validation
drop policy if exists "Users can insert own exercises" on exercises;
drop policy if exists "Users can update own exercises" on exercises;

-- Recreate INSERT policy with category ownership check
create policy "Users can insert own exercises"
  on exercises for insert
  with check (
    user_id = auth.uid()
    and (
      category_id is null
      or exists (
        select 1 from categories
        where categories.id = category_id
          and (categories.user_id is null or categories.user_id = auth.uid())
      )
    )
  );

-- Recreate UPDATE policy with category ownership check
create policy "Users can update own exercises"
  on exercises for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      category_id is null
      or exists (
        select 1 from categories
        where categories.id = category_id
          and (categories.user_id is null or categories.user_id = auth.uid())
      )
    )
  );
