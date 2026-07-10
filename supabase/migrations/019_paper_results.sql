-- WP-033: wyniki papierowe, audyt, skill_evidence

create table if not exists public.paper_results (
  id uuid primary key default gen_random_uuid(),
  assessment_version_id uuid not null references public.assessment_versions(id) on delete cascade,
  assignment_id uuid references public.assignments(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  version_code text not null check (version_code in ('A', 'B', 'C')),
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'absent')),
  total_score numeric,
  max_score numeric not null,
  percentage numeric check (percentage is null or (percentage >= 0 and percentage <= 100)),
  mark smallint check (mark is null or (mark >= 1 and mark <= 6)),
  comment text,
  entered_by uuid not null references public.profiles(id) on delete cascade,
  confirmed_by uuid references public.profiles(id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_version_id, student_id)
);

create index if not exists paper_results_class_idx
  on public.paper_results (class_id, assessment_version_id, status);

create table if not exists public.paper_result_items (
  id uuid primary key default gen_random_uuid(),
  paper_result_id uuid not null references public.paper_results(id) on delete cascade,
  slot_id text not null,
  position integer not null check (position > 0),
  skill_id text not null,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  comment text,
  source text not null default 'paper_manual' check (source = 'paper_manual'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paper_result_id, slot_id)
);

create table if not exists public.grade_audit_log (
  id uuid primary key default gen_random_uuid(),
  record_kind text not null check (record_kind in ('paper_result', 'paper_result_item')),
  record_id uuid not null,
  school_id uuid not null references public.schools(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  field_name text not null,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists grade_audit_log_record_idx
  on public.grade_audit_log (record_kind, record_id, created_at desc);

create table if not exists public.skill_evidence (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  skill_id text not null,
  curriculum_id text not null,
  source_type text not null check (source_type in ('live', 'practice', 'digital_assessment', 'paper_manual')),
  source_id uuid not null,
  raw_score numeric not null,
  raw_max numeric not null check (raw_max > 0),
  weight numeric not null default 1 check (weight > 0),
  policy_version text not null default '2026.1',
  occurred_at timestamptz not null default now(),
  unique (source_type, source_id, skill_id)
);

create index if not exists skill_evidence_student_idx
  on public.skill_evidence (student_id, skill_id, occurred_at desc);

alter table public.paper_results enable row level security;
alter table public.paper_result_items enable row level security;
alter table public.grade_audit_log enable row level security;
alter table public.skill_evidence enable row level security;

-- RLS: nauczyciel właściciel klasy w tej samej szkole
drop policy if exists "Teachers manage paper results" on public.paper_results;
create policy "Teachers manage paper results"
  on public.paper_results for all
  using (
    exists (
      select 1 from public.teacher_classes tc
      where tc.id = paper_results.class_id
        and tc.teacher_id = auth.uid()
        and tc.school_id = paper_results.school_id
    )
  )
  with check (
    exists (
      select 1 from public.teacher_classes tc
      where tc.id = paper_results.class_id
        and tc.teacher_id = auth.uid()
        and tc.school_id = paper_results.school_id
    )
    and entered_by = auth.uid()
  );

drop policy if exists "Teachers manage paper result items" on public.paper_result_items;
create policy "Teachers manage paper result items"
  on public.paper_result_items for all
  using (
    exists (
      select 1
      from public.paper_results pr
      join public.teacher_classes tc on tc.id = pr.class_id
      where pr.id = paper_result_items.paper_result_id
        and tc.teacher_id = auth.uid()
        and tc.school_id = pr.school_id
    )
  )
  with check (
    exists (
      select 1
      from public.paper_results pr
      join public.teacher_classes tc on tc.id = pr.class_id
      where pr.id = paper_result_items.paper_result_id
        and tc.teacher_id = auth.uid()
        and tc.school_id = pr.school_id
    )
  );

drop policy if exists "Teachers read grade audit log" on public.grade_audit_log;
create policy "Teachers read grade audit log"
  on public.grade_audit_log for select
  using (
    exists (
      select 1 from public.teacher_school_memberships m
      where m.teacher_id = auth.uid() and m.school_id = grade_audit_log.school_id
    )
  );

drop policy if exists "Teachers read skill evidence" on public.skill_evidence;
create policy "Teachers read skill evidence"
  on public.skill_evidence for select
  using (
    exists (
      select 1 from public.teacher_school_memberships m
      where m.teacher_id = auth.uid() and m.school_id = skill_evidence.school_id
    )
  );

drop policy if exists "Students read own skill evidence" on public.skill_evidence;
create policy "Students read own skill evidence"
  on public.skill_evidence for select
  using (student_id = auth.uid());

-- Rejestr wersji oceny do wpisu papierowego (bez cyfrowego przypisania)
create or replace function public.ensure_assessment_version(
  target_class_id uuid,
  blueprint_id text,
  blueprint_version integer,
  version_code text,
  version_seed integer,
  snapshot jsonb,
  answer_key jsonb,
  content_checksum text,
  max_score numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_version_id uuid;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Nie znaleziono klasy/grupy.';
  end if;

  insert into public.assessment_versions (
    school_id,
    teacher_id,
    blueprint_id,
    blueprint_version,
    version_code,
    version_seed,
    snapshot,
    answer_key,
    checksum,
    max_score
  )
  values (
    v_class.school_id,
    v_teacher_id,
    blueprint_id,
    blueprint_version,
    version_code,
    version_seed,
    snapshot,
    answer_key,
    content_checksum,
    max_score
  )
  on conflict (blueprint_id, blueprint_version, version_code, version_seed, school_id)
  do update set checksum = excluded.checksum
  returning id into v_version_id;

  if v_version_id is null then
    select av.id into v_version_id
    from public.assessment_versions av
    where av.blueprint_id = ensure_assessment_version.blueprint_id
      and av.blueprint_version = ensure_assessment_version.blueprint_version
      and av.version_code = ensure_assessment_version.version_code
      and av.version_seed = ensure_assessment_version.version_seed
      and av.school_id = v_class.school_id;
  end if;

  return v_version_id;
end;
$$;

revoke all on function public.ensure_assessment_version(uuid, text, integer, text, integer, jsonb, jsonb, text, numeric) from public;
grant execute on function public.ensure_assessment_version(uuid, text, integer, text, integer, jsonb, jsonb, text, numeric) to authenticated;

create or replace function public.compute_mark_from_percentage(p_percentage numeric)
returns smallint
language sql
immutable
as $$
  select case
    when p_percentage is null then null
    when p_percentage >= 96 then 6
    when p_percentage >= 86 then 5
    when p_percentage >= 70 then 4
    when p_percentage >= 50 then 3
    when p_percentage >= 30 then 2
    else 1
  end;
$$;

create or replace function public.save_paper_result_draft(
  target_assessment_version_id uuid,
  target_class_id uuid,
  target_student_id uuid,
  target_version_code text,
  target_status text,
  target_items jsonb,
  target_comment text default null,
  correction_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_version public.assessment_versions%rowtype;
  v_result public.paper_results%rowtype;
  v_result_id uuid;
  v_item jsonb;
  v_total numeric := 0;
  v_max numeric;
  v_percentage numeric;
  v_old_status text;
  v_old_total numeric;
  v_slot_id text;
  v_old_score numeric;
  v_new_score numeric;
  v_max_item numeric;
  v_skill_id text;
  v_position integer;
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if target_status not in ('draft', 'absent') then
    raise exception 'Szkic może mieć status draft lub absent.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Brak dostępu do klasy.';
  end if;

  select * into v_version
  from public.assessment_versions
  where id = target_assessment_version_id and school_id = v_class.school_id;

  if not found then
    raise exception 'Nie znaleziono wersji oceny.';
  end if;

  if not exists (
    select 1 from public.class_members cm
    where cm.class_id = target_class_id and cm.student_id = target_student_id
  ) then
    raise exception 'Uczeń nie należy do wybranej klasy.';
  end if;

  v_max := v_version.max_score;

  select * into v_result
  from public.paper_results
  where assessment_version_id = target_assessment_version_id
    and student_id = target_student_id;

  if found and v_result.status = 'confirmed' then
    if correction_reason is null or length(trim(correction_reason)) = 0 then
      raise exception 'Korekta zatwierdzonego wyniku wymaga powodu.';
    end if;
    v_old_status := v_result.status;
    v_old_total := v_result.total_score;
  end if;

  if target_status = 'absent' then
    v_total := null;
    v_percentage := null;
  else
    for v_item in select value from jsonb_array_elements(coalesce(target_items, '[]'::jsonb)) loop
      v_new_score := coalesce((v_item ->> 'score')::numeric, 0);
      v_max_item := coalesce((v_item ->> 'maxScore')::numeric, 0);
      if v_new_score < 0 or v_new_score > v_max_item then
        raise exception 'Punkty poza zakresem dla zadania %.', v_item ->> 'slotId';
      end if;
      v_total := v_total + v_new_score;
    end loop;
    v_percentage := case when v_max > 0 then round((v_total / v_max) * 100) else 0 end;
  end if;

  insert into public.paper_results (
    assessment_version_id,
    student_id,
    school_id,
    class_id,
    version_code,
    status,
    total_score,
    max_score,
    percentage,
    mark,
    comment,
    entered_by,
    updated_at
  )
  values (
    target_assessment_version_id,
    target_student_id,
    v_class.school_id,
    target_class_id,
    target_version_code,
    target_status,
    v_total,
    v_max,
    v_percentage,
    public.compute_mark_from_percentage(v_percentage),
    target_comment,
    v_teacher_id,
    now()
  )
  on conflict (assessment_version_id, student_id) do update
  set
    status = case
      when paper_results.status = 'confirmed' then 'confirmed'
      else excluded.status
    end,
    total_score = excluded.total_score,
    max_score = excluded.max_score,
    percentage = excluded.percentage,
    mark = excluded.mark,
    comment = excluded.comment,
    version_code = excluded.version_code,
    entered_by = excluded.entered_by,
    updated_at = now()
  returning id into v_result_id;

  if target_status = 'absent' then
    delete from public.paper_result_items where paper_result_id = v_result_id;
  else
    delete from public.paper_result_items where paper_result_id = v_result_id;

    for v_item in select value from jsonb_array_elements(coalesce(target_items, '[]'::jsonb)) loop
      v_slot_id := v_item ->> 'slotId';
      v_new_score := coalesce((v_item ->> 'score')::numeric, 0);
      v_max_item := coalesce((v_item ->> 'maxScore')::numeric, 1);
      v_skill_id := coalesce(v_item ->> 'skillId', 'unknown');
      v_position := coalesce((v_item ->> 'position')::integer, 1);

      if v_result.status = 'confirmed' and correction_reason is not null then
        select pri.score into v_old_score
        from public.paper_result_items pri
        where pri.paper_result_id = v_result_id and pri.slot_id = v_slot_id;

        if v_old_score is distinct from v_new_score then
          insert into public.grade_audit_log (
            record_kind, record_id, school_id, actor_id, field_name, old_value, new_value, reason
          )
          values (
            'paper_result_item',
            v_result_id,
            v_class.school_id,
            v_teacher_id,
            v_slot_id,
            jsonb_build_object('score', v_old_score),
            jsonb_build_object('score', v_new_score),
            correction_reason
          );
        end if;
      end if;

      insert into public.paper_result_items (
        paper_result_id, slot_id, position, skill_id, score, max_score
      )
      values (
        v_result_id, v_slot_id, v_position, v_skill_id, v_new_score, v_max_item
      );
    end loop;
  end if;

  if v_result.status = 'confirmed' and correction_reason is not null
     and (v_old_total is distinct from v_total or v_old_status is distinct from target_status) then
    insert into public.grade_audit_log (
      record_kind, record_id, school_id, actor_id, field_name, old_value, new_value, reason
    )
    values (
      'paper_result',
      v_result_id,
      v_class.school_id,
      v_teacher_id,
      'total_score',
      jsonb_build_object('status', v_old_status, 'total', v_old_total),
      jsonb_build_object('status', target_status, 'total', v_total),
      correction_reason
    );
  end if;

  return v_result_id;
end;
$$;

revoke all on function public.save_paper_result_draft(uuid, uuid, uuid, text, text, jsonb, text, text) from public;
grant execute on function public.save_paper_result_draft(uuid, uuid, uuid, text, text, jsonb, text, text) to authenticated;

create or replace function public.confirm_paper_results(
  target_assessment_version_id uuid,
  target_class_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
  v_class public.teacher_classes%rowtype;
  v_count integer := 0;
  v_result record;
  v_curriculum_id text := 'pl-math-5-2026-classic';
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  select * into v_class
  from public.teacher_classes
  where id = target_class_id and teacher_id = v_teacher_id;

  if not found then
    raise exception 'Brak dostępu do klasy.';
  end if;

  select coalesce(t.curriculum_id, v_curriculum_id) into v_curriculum_id
  from public.assessment_versions av
  left join public.assignments a on a.assessment_version_id = av.id
  left join public.tests t on t.id = a.test_id
  where av.id = target_assessment_version_id
  limit 1;

  for v_result in
    select pr.id, pr.student_id, pr.school_id, pr.class_id, pr.status, pr.total_score, pr.max_score
    from public.paper_results pr
    where pr.assessment_version_id = target_assessment_version_id
      and pr.class_id = target_class_id
      and pr.status in ('draft', 'absent')
  loop
    update public.paper_results
    set
      status = case when v_result.status = 'absent' then 'absent' else 'confirmed' end,
      confirmed_by = v_teacher_id,
      confirmed_at = now(),
      updated_at = now()
    where id = v_result.id;

    if v_result.status <> 'absent' then
      insert into public.skill_evidence (
        student_id, school_id, class_id, skill_id, curriculum_id,
        source_type, source_id, raw_score, raw_max, occurred_at
      )
      select
        v_result.student_id,
        v_result.school_id,
        v_result.class_id,
        agg.skill_id,
        v_curriculum_id,
        'paper_manual',
        v_result.id,
        agg.raw_score,
        agg.raw_max,
        now()
      from (
        select
          pri.skill_id,
          sum(pri.score) as raw_score,
          sum(pri.max_score) as raw_max
        from public.paper_result_items pri
        where pri.paper_result_id = v_result.id
        group by pri.skill_id
      ) agg
      on conflict (source_type, source_id, skill_id) do update
      set
        raw_score = excluded.raw_score,
        raw_max = excluded.raw_max,
        occurred_at = excluded.occurred_at;
    end if;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.confirm_paper_results(uuid, uuid) from public;
grant execute on function public.confirm_paper_results(uuid, uuid) to authenticated;

create or replace function public.list_paper_results(
  target_assessment_version_id uuid,
  target_class_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid := auth.uid();
begin
  if v_teacher_id is null then
    raise exception 'Wymagane logowanie nauczyciela.';
  end if;

  if not exists (
    select 1 from public.teacher_classes tc
    where tc.id = target_class_id and tc.teacher_id = v_teacher_id
  ) then
    raise exception 'Brak dostępu do klasy.';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', pr.id,
          'studentId', pr.student_id,
          'status', pr.status,
          'totalScore', pr.total_score,
          'maxScore', pr.max_score,
          'percentage', pr.percentage,
          'mark', pr.mark,
          'comment', pr.comment,
          'versionCode', pr.version_code,
          'items', coalesce(
            (
              select jsonb_agg(
                jsonb_build_object(
                  'slotId', pri.slot_id,
                  'position', pri.position,
                  'skillId', pri.skill_id,
                  'score', pri.score,
                  'maxScore', pri.max_score
                )
                order by pri.position
              )
              from public.paper_result_items pri
              where pri.paper_result_id = pr.id
            ),
            '[]'::jsonb
          )
        )
        order by pr.updated_at
      )
      from public.paper_results pr
      where pr.assessment_version_id = target_assessment_version_id
        and pr.class_id = target_class_id
    ),
    '[]'::jsonb
  );
end;
$$;

revoke all on function public.list_paper_results(uuid, uuid) from public;
grant execute on function public.list_paper_results(uuid, uuid) to authenticated;
