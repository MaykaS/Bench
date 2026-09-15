-- Personal workspace: only the server's service role may execute these RPCs.
-- Device capabilities replace email accounts; no table is exposed to browsers.
create table public.bench_workspace (
  id uuid primary key,
  revision bigint not null default 0
);
insert into public.bench_workspace(id) values ('00000000-0000-0000-0000-000000000001');

create table public.bench_devices (
  id uuid primary key, user_id uuid not null references public.bench_workspace(id),
  name text not null, token_hash text unique not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null,
  revoked_at timestamptz
);
create table public.bench_pair_tokens (
  token_hash text primary key, user_id uuid not null references public.bench_workspace(id),
  issuer_id uuid references public.bench_devices(id), expires_at timestamptz not null
);
create table public.bench_cases (id text not null, user_id uuid not null references public.bench_workspace(id), data jsonb not null, primary key(user_id,id));
create table public.bench_pei (like public.bench_cases including all);
alter table public.bench_pei add foreign key(user_id) references public.bench_workspace(id);
create table public.bench_applications (like public.bench_cases including all);
alter table public.bench_applications add foreign key(user_id) references public.bench_workspace(id);
create table public.bench_network (like public.bench_cases including all);
alter table public.bench_network add foreign key(user_id) references public.bench_workspace(id);

do $$ declare t text; begin
  foreach t in array array['bench_workspace','bench_devices','bench_pair_tokens','bench_cases','bench_pei','bench_applications','bench_network'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
  end loop;
end $$;

create function public.bench_pair(p_action text, p_hash text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid := '00000000-0000-0000-0000-000000000001'; device public.bench_devices; claimed uuid;
begin
  -- Serialize claims, revocations and link issuance.
  perform 1 from bench_workspace where id=owner_id for update;
  if p_action = 'redeem' then
    delete from bench_pair_tokens p where p.token_hash=p_hash and p.expires_at > now()
      and (p.issuer_id is null or exists(select 1 from bench_devices d where d.id=p.issuer_id and d.revoked_at is null and d.expires_at>now()))
      returning p.user_id into claimed;
    if claimed is null then raise exception 'PAIR_INVALID'; end if;
    insert into bench_devices(id,user_id,name,token_hash,expires_at)
      values((p_payload->>'id')::uuid,claimed,p_payload->>'name',p_payload->>'hash',now()+interval '365 days');
    return jsonb_build_object('userId',claimed);
  end if;
  if p_action <> 'bootstrap' then
    select * into device from bench_devices where token_hash=p_hash and revoked_at is null and expires_at>now();
    if device.id is null then raise exception 'DEVICE_INVALID'; end if;
    owner_id := device.user_id;
  end if;
  if p_action in ('bootstrap','issue') then
    delete from bench_pair_tokens where expires_at<=now();
    insert into bench_pair_tokens(token_hash,user_id,issuer_id,expires_at)
      values(p_payload->>'hash',owner_id,device.id,now()+interval '10 minutes');
    return jsonb_build_object('expiresIn',600);
  elsif p_action = 'status' then
    return jsonb_build_object('userId',owner_id,'deviceId',device.id);
  elsif p_action = 'list' then
    return jsonb_build_object('deviceId',device.id,'devices',(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'name',d.name,'createdAt',d.created_at,'expiresAt',d.expires_at) order by d.created_at),'[]') from bench_devices d where d.user_id=owner_id and d.revoked_at is null and d.expires_at>now()));
  elsif p_action = 'revoke' then
    update bench_devices set revoked_at=now() where id=(p_payload->>'id')::uuid and user_id=owner_id;
    delete from bench_pair_tokens where issuer_id=(p_payload->>'id')::uuid and user_id=owner_id;
    return '{}';
  end if;
  raise exception 'ACTION_INVALID';
end $$;

create function public.bench_data(p_hash text, p_revision bigint default null, p_data jsonb default null) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid := '00000000-0000-0000-0000-000000000001'; current_revision bigint; t text; key text;
begin
  select revision into current_revision from bench_workspace where id=owner_id for update;
  if not exists(select 1 from bench_devices where token_hash=p_hash and user_id=owner_id and revoked_at is null and expires_at>now()) then raise exception 'DEVICE_INVALID'; end if;
  if p_data is not null then
    if p_revision is distinct from current_revision then raise exception 'REVISION_CONFLICT'; end if;
    foreach key in array array['cases','pei','applications','network'] loop
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
    'network',(select coalesce(jsonb_agg(data order by id),'[]') from bench_network where user_id=owner_id)));
end $$;
revoke all on function public.bench_pair(text,text,jsonb) from public, anon, authenticated;
revoke all on function public.bench_data(text,bigint,jsonb) from public, anon, authenticated;
grant execute on function public.bench_pair(text,text,jsonb) to service_role;
grant execute on function public.bench_data(text,bigint,jsonb) to service_role;
