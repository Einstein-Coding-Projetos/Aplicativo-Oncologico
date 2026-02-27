# Migration Safety Notes

## Core migration `0007_normalize_appointment_status_and_require_user`

This migration enforces `core_appointment.user_id` as non-null.

### Why data can be removed
Historical rows with `user_id IS NULL` cannot satisfy the non-null foreign key constraint, so the migration deletes only those orphan rows.

### Required pre-migration backup
Run a table backup before applying migrations in staging/production:

```bash
pg_dump --data-only --table=core_appointment "$DATABASE_URL" > backup_core_appointment.sql
```

If you are using separate `POSTGRES_*` variables:

```bash
pg_dump --data-only \
  --host="$POSTGRES_HOST" \
  --port="$POSTGRES_PORT" \
  --username="$POSTGRES_USER" \
  --dbname="$POSTGRES_DB" \
  --table=core_appointment \
  > backup_core_appointment.sql
```

### Post-migration verification

```sql
SELECT COUNT(*) AS orphan_count
FROM core_appointment
WHERE user_id IS NULL;
```

Expected result: `0`.

### Status normalization done by migration
- `concluído` -> `concluido`
- unknown status -> `pendente`
