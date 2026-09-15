-- Additive: old clients omit preparation and must never erase it.
begin;
create table if not exists public.bench_preparation (
  id text not null, user_id uuid not null references public.bench_workspace(id),
  data jsonb not null, primary key(user_id,id)
);
alter table public.bench_preparation enable row level security;
revoke all on public.bench_preparation from anon, authenticated;
create or replace function public.bench_data(p_hash text, p_revision bigint default null, p_data jsonb default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid := '00000000-0000-0000-0000-000000000001'; current_revision bigint; t text; key text;
begin
  select revision into current_revision from bench_workspace where id=owner_id for update;
  if not exists(select 1 from bench_devices where token_hash=p_hash and user_id=owner_id and revoked_at is null and expires_at>now()) then raise exception 'DEVICE_INVALID'; end if;
  if p_data is not null then
    if p_revision is distinct from current_revision then raise exception 'REVISION_CONFLICT'; end if;
    foreach key in array array['cases','pei','applications','network','preparation'] loop
      if key = 'preparation' and not (p_data ? key) then continue; end if;
      if jsonb_typeof(p_data->key) is distinct from 'array' then raise exception 'DATA_INVALID'; end if;
      t := 'bench_' || key;
      execute format('delete from public.%I where user_id=$1',t) using owner_id;
      execute format('insert into public.%I(id,user_id,data) select r->>''id'',$1,jsonb_set(r,''{userId}'',to_jsonb($1::text)) from jsonb_array_elements($2) r',t) using owner_id,p_data->key;
    end loop;
    update bench_workspace set revision=revision+1 where id=owner_id returning revision into current_revision;
  end if;
  return jsonb_build_object('revision',current_revision,'data',jsonb_build_object(
    'cases',(select coalesce(jsonb_agg(data order by id),'[]') from bench_cases where user_id=owner_id),
    'pei',(select coalesce(jsonb_agg(data order by id),'[]') from bench_pei where user_id=owner_id),
    'applications',(select coalesce(jsonb_agg(data order by id),'[]') from bench_applications where user_id=owner_id),
    'preparation',(select coalesce(jsonb_agg(data order by id),'[]') from bench_preparation where user_id=owner_id),
    'network',(select coalesce(jsonb_agg(data order by id),'[]') from bench_network where user_id=owner_id)));
end $$;

revoke all on function public.bench_data(text,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.bench_data(text,bigint,jsonb) to service_role;
commit;
