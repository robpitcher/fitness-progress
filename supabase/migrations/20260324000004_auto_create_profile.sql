-- Auto-create profile on user signup
-- This trigger ensures every new auth.users row gets a corresponding profiles row

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.email
    )
  );
  return new;
end;
$$;

-- Trigger to call handle_new_user on auth.users INSERT
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill profiles for existing auth.users who don't have one
insert into public.profiles (id, display_name)
select
  au.id,
  coalesce(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    au.email
  ) as display_name
from auth.users au
left join public.profiles p on au.id = p.id
where p.id is null;
