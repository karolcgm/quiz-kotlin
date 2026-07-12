create table if not exists public.billing_upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  current_students integer not null check (current_students >= 0),
  requested_seats integer not null check (requested_seats between 21 and 500),
  annual_price numeric(10,2) not null check (annual_price >= 240),
  status text not null default 'requested' check (status in ('requested', 'reviewed', 'approved', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.billing_upgrade_requests enable row level security;

create policy "Teachers create own billing upgrade requests"
on public.billing_upgrade_requests for insert to authenticated
with check (
  teacher_id = auth.uid()
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher' and status = 'active')
);

create policy "Teachers read own billing upgrade requests"
on public.billing_upgrade_requests for select to authenticated
using (teacher_id = auth.uid());
