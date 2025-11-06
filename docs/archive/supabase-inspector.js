import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'your-project-ref.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'YOUR_SERVICE_ROLE_KEY',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectDatabase() {
  try {
    await client.connect();
    console.log('# SUPABASE INSTANCE MASTER DOCUMENTATION\n');
    console.log('Generated on:', new Date().toISOString());
    console.log('Project URL: https://your-project-ref.supabase.co\n');

    // 1. SCHEMAS
    console.log('## SCHEMAS\n');
    const schemas = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schema_name;
    `);
    schemas.rows.forEach(row => console.log(`- ${row.schema_name}`));
    console.log('\n');

    // 2. TABLES AND COLUMNS
    console.log('## TABLES AND COLUMNS\n');
    const tables = await client.query(`
      SELECT
        t.table_schema,
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.ordinal_position
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE t.table_type = 'BASE TABLE'
        AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY t.table_schema, t.table_name, c.ordinal_position;
    `);

    let currentTable = '';
    tables.rows.forEach(row => {
      if (currentTable !== `${row.table_schema}.${row.table_name}`) {
        console.log(`### ${row.table_schema}.${row.table_name}\n`);
        currentTable = `${row.table_schema}.${row.table_name}`;
      }
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const precision = row.numeric_precision && row.numeric_scale ? `(${row.numeric_precision},${row.numeric_scale})` : '';
      console.log(`- \`${row.column_name}\` ${row.data_type}${length}${precision} ${nullable}${defaultVal}`);
    });
    console.log('\n');

    // 3. PRIMARY KEYS
    console.log('## PRIMARY KEYS\n');
    const pks = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        c.data_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.columns c ON kcu.table_name = c.table_name
        AND kcu.table_schema = c.table_schema
        AND kcu.column_name = c.column_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position;
    `);

    currentTable = '';
    pks.rows.forEach(row => {
      if (currentTable !== `${row.table_schema}.${row.table_name}`) {
        console.log(`### ${row.table_schema}.${row.table_name}`);
        currentTable = `${row.table_schema}.${row.table_name}`;
      }
      console.log(`- \`${row.column_name}\` (${row.data_type})`);
    });
    console.log('\n');

    // 4. FOREIGN KEYS
    console.log('## FOREIGN KEYS\n');
    const fks = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
    `);

    fks.rows.forEach(row => {
      console.log(`- ${row.table_schema}.${row.table_name}.\`${row.column_name}\` → ${row.foreign_table_schema}.${row.foreign_table_name}.\`${row.foreign_column_name}\``);
    });
    console.log('\n');

    // 5. INDEXES
    console.log('## INDEXES\n');
    const indexes = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schemaname, tablename, indexname;
    `);

    currentTable = '';
    indexes.rows.forEach(row => {
      if (currentTable !== `${row.schemaname}.${row.tablename}`) {
        console.log(`### ${row.schemaname}.${row.tablename}`);
        currentTable = `${row.schemaname}.${row.tablename}`;
      }
      console.log(`- \`${row.indexname}\`: ${row.indexdef}`);
    });
    console.log('\n');

    // 6. ROW LEVEL SECURITY POLICIES
    console.log('## ROW LEVEL SECURITY POLICIES\n');
    const policies = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schemaname, tablename, policyname;
    `);

    currentTable = '';
    policies.rows.forEach(row => {
      if (currentTable !== `${row.schemaname}.${row.tablename}`) {
        console.log(`### ${row.schemaname}.${row.tablename}`);
        currentTable = `${row.schemaname}.${row.tablename}`;
      }
      console.log(`#### ${row.policyname}`);
      console.log(`- **Permissive**: ${row.permissive}`);
      console.log(`- **Roles**: ${row.roles ? row.roles.join(', ') : 'ALL'}`);
      console.log(`- **Command**: ${row.cmd}`);
      if (row.qual) console.log(`- **Using**: ${row.qual}`);
      if (row.with_check) console.log(`- **With Check**: ${row.with_check}`);
      console.log('');
    });

    // 7. FUNCTIONS
    console.log('## FUNCTIONS\n');
    const functions = await client.query(`
      SELECT
        n.nspname AS schema_name,
        p.proname AS function_name,
        pg_get_function_identity_arguments(p.oid) AS arguments,
        pg_get_function_result(p.oid) AS return_type,
        obj_description(p.oid, 'pg_proc') AS description,
        p.prosrc AS source
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY n.nspname, p.proname;
    `);

    functions.rows.forEach(row => {
      console.log(`### ${row.schema_name}.${row.function_name}(${row.arguments})`);
      console.log(`**Returns:** ${row.return_type}`);
      if (row.description) console.log(`**Description:** ${row.description}`);
      console.log(`**Source:**`);
      console.log('```sql');
      console.log(row.source);
      console.log('```');
      console.log('');
    });

    // 8. TRIGGERS
    console.log('## TRIGGERS\n');
    const triggers = await client.query(`
      SELECT
        event_object_schema,
        event_object_table,
        trigger_name,
        event_manipulation,
        action_timing,
        action_condition,
        action_statement
      FROM information_schema.triggers
      WHERE event_object_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY event_object_schema, event_object_table, trigger_name;
    `);

    currentTable = '';
    triggers.rows.forEach(row => {
      if (currentTable !== `${row.event_object_schema}.${row.event_object_table}`) {
        console.log(`### ${row.event_object_schema}.${row.event_object_table}`);
        currentTable = `${row.event_object_schema}.${row.event_object_table}`;
      }
      console.log(`#### ${row.trigger_name}`);
      console.log(`- **Events**: ${row.event_manipulation}`);
      console.log(`- **Timing**: ${row.action_timing}`);
      if (row.action_condition) console.log(`- **Condition**: ${row.action_condition}`);
      console.log(`- **Action**: ${row.action_statement}`);
      console.log('');
    });

    // 9. VIEWS
    console.log('## VIEWS\n');
    const views = await client.query(`
      SELECT
        table_schema,
        table_name,
        view_definition
      FROM information_schema.views
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY table_schema, table_name;
    `);

    views.rows.forEach(row => {
      console.log(`### ${row.table_schema}.${row.table_name}`);
      console.log('```sql');
      console.log(row.view_definition);
      console.log('```');
      console.log('');
    });

    // 10. SEQUENCES
    console.log('## SEQUENCES\n');
    const sequences = await client.query(`
      SELECT
        sequence_schema,
        sequence_name,
        data_type,
        start_value,
        minimum_value,
        maximum_value,
        increment,
        cycle_option
      FROM information_schema.sequences
      WHERE sequence_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY sequence_schema, sequence_name;
    `);

    sequences.rows.forEach(row => {
      console.log(`### ${row.sequence_schema}.${row.sequence_name}`);
      console.log(`- **Type**: ${row.data_type}`);
      console.log(`- **Start**: ${row.start_value}`);
      console.log(`- **Min**: ${row.minimum_value}`);
      console.log(`- **Max**: ${row.maximum_value}`);
      console.log(`- **Increment**: ${row.increment}`);
      console.log(`- **Cycle**: ${row.cycle_option}`);
      console.log('');
    });

    // 11. ENUMS
    console.log('## ENUMS\n');
    const enums = await client.query(`
      SELECT
        n.nspname AS schema_name,
        t.typname AS enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      GROUP BY n.nspname, t.typname
      ORDER BY n.nspname, t.typname;
    `);

    enums.rows.forEach(row => {
      console.log(`### ${row.schema_name}.${row.enum_name}`);
      console.log(`- Values: ${row.enum_values.join(', ')}`);
      console.log('');
    });

    // 12. EXTENSIONS
    console.log('## EXTENSIONS\n');
    const extensions = await client.query(`
      SELECT
        name,
        default_version,
        installed_version,
        comment
      FROM pg_available_extensions
      WHERE installed_version IS NOT NULL
      ORDER BY name;
    `);

    extensions.rows.forEach(row => {
      console.log(`- **${row.name}** (${row.installed_version}) - ${row.comment || 'No description'}`);
    });
    console.log('\n');

    // 13. ROLES AND PERMISSIONS
    console.log('## ROLES AND PERMISSIONS\n');
    const roles = await client.query(`
      SELECT
        r.rolname,
        r.rolsuper,
        r.rolinherit,
        r.rolcreaterole,
        r.rolcreatedb,
        r.rolcanlogin,
        r.rolreplication,
        r.rolbypassrls
      FROM pg_roles r
      WHERE r.rolname NOT IN ('pg_signal_backend', 'pg_read_all_settings', 'pg_read_all_stats', 'pg_stat_scan_tables', 'pg_read_server_files', 'pg_write_server_files', 'pg_execute_server_program', 'pg_monitor')
      ORDER BY r.rolname;
    `);

    roles.rows.forEach(row => {
      console.log(`### ${row.rolname}`);
      console.log(`- **Superuser**: ${row.rolsuper}`);
      console.log(`- **Inherit**: ${row.rolinherit}`);
      console.log(`- **Create Role**: ${row.rolcreaterole}`);
      console.log(`- **Create DB**: ${row.rolcreatedb}`);
      console.log(`- **Can Login**: ${row.rolcanlogin}`);
      console.log(`- **Replication**: ${row.rolreplication}`);
      console.log(`- **Bypass RLS**: ${row.rolbypassrls}`);
      console.log('');
    });

    // 14. TABLE PRIVILEGES
    console.log('## TABLE PRIVILEGES\n');
    const privileges = await client.query(`
      SELECT
        schemaname,
        tablename,
        grantee,
        privilege_type
      FROM information_schema.role_table_grants
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schemaname, tablename, grantee, privilege_type;
    `);

    currentTable = '';
    privileges.rows.forEach(row => {
      if (currentTable !== `${row.schemaname}.${row.tablename}`) {
        console.log(`### ${row.schemaname}.${row.tablename}`);
        currentTable = `${row.schemaname}.${row.tablename}`;
      }
      console.log(`- ${row.grantee}: ${row.privilege_type}`);
    });
    console.log('\n');

    // 15. CHECK CONSTRAINTS
    console.log('## CHECK CONSTRAINTS\n');
    const checks = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.constraint_type = 'CHECK'
        AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
    `);

    currentTable = '';
    checks.rows.forEach(row => {
      if (currentTable !== `${row.table_schema}.${row.table_name}`) {
        console.log(`### ${row.table_schema}.${row.table_name}`);
        currentTable = `${row.table_schema}.${row.table_name}`;
      }
      console.log(`- **${row.constraint_name}**: ${row.check_clause}`);
    });
    console.log('\n');

    // 16. UNIQUE CONSTRAINTS
    console.log('## UNIQUE CONSTRAINTS\n');
    const uniques = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
        AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name, kcu.ordinal_position;
    `);

    currentTable = '';
    uniques.rows.forEach(row => {
      if (currentTable !== `${row.table_schema}.${row.table_name}`) {
        console.log(`### ${row.table_schema}.${row.table_name}`);
        currentTable = `${row.table_schema}.${row.table_name}`;
      }
      console.log(`- **${row.constraint_name}**: \`${row.column_name}\``);
    });
    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

inspectDatabase();
