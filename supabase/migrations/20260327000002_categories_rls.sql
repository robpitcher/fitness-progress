-- Row Level Security Policies for categories table

-- Enable RLS
alter table categories enable row level security;

-- Users can view default categories (user_id IS NULL) and their own categories
create policy "Users can view default and own categories"
  on categories for select
  using (user_id is null or user_id = auth.uid());

-- Users can insert their own categories
create policy "Users can insert own categories"
  on categories for insert
  with check (user_id = auth.uid());

-- Users can update their own categories (not defaults)
create policy "Users can update own categories"
  on categories for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Users can delete their own categories (not defaults)
create policy "Users can delete own categories"
  on categories for delete
  using (user_id = auth.uid());

-- Trigger to update category text in exercises when category name changes
create or replace function sync_exercises_on_category_update()
returns trigger as $$
begin
  -- Update all exercises using this category to have the new name
  update exercises
  set category = new.name
  where category_id = new.id;

  return new;
end;
$$ language plpgsql;

create trigger sync_exercises_on_category_update_trigger
  after update of name
  on categories
  for each row
  when (old.name is distinct from new.name)
  execute function sync_exercises_on_category_update();

