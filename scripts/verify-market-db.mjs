// Isolated PostgreSQL test, NEVER connects to the configured application database.
// Provision @electric-sql/pglite outside the project, then set PGLITE_MODULE to
// its dist/index.js path. No application dependency is added for this tool.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
if (!process.env.PGLITE_MODULE)
  throw new Error(
    "Set PGLITE_MODULE to an externally installed @electric-sql/pglite dist/index.js",
  );
const { PGlite } = await import(pathToFileURL(process.env.PGLITE_MODULE).href);
const db = new PGlite();
let checks = 0;
const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
const score = JSON.stringify({ demand: 3, growth: 3, fit: 3, feasibility: 3, resilience: 3 });
async function check(label, fn) {
  await fn();
  checks++;
  console.log(`PASS ${label}`);
}
async function denied(sql, params = []) {
  await assert.rejects(
    () => db.query(sql, params),
    (error) => ["42501", "23514"].includes(error.code),
  );
}
async function asUser(id) {
  await db.exec("RESET ROLE; SET ROLE authenticated");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id]);
}
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;`);
  for (const name of ["0000_navoscope_private_profiles.sql", "0001_market_workflows.sql"]) {
    await db.exec(
      await readFile(new URL(`../drizzle/migrations/${name}`, import.meta.url), "utf8"),
    );
  }
  await db.query(
    'INSERT INTO auth.users(id, raw_user_meta_data) VALUES ($1, \'{"display_name":"Alice fixture"}\'), ($2, \'{"display_name":"Bob fixture"}\')',
    [alice, bob],
  );
  await asUser(alice);
  await check("profile trigger and private profile visibility", async () => {
    const rows = (await db.query("SELECT * FROM profiles")).rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, alice);
  });
  await check("illustrative catalog readable but not writable", async () => {
    assert.equal((await db.query("SELECT * FROM markets")).rows.length, 6);
    await denied("UPDATE markets SET name = 'tampered'");
  });
  await check("owner saves an evaluation", async () => {
    await db.query(
      "INSERT INTO opportunity_evaluations(user_id,market_id,scores) VALUES ($1,'eu-heat-pumps',$2)",
      [alice, score],
    );
    assert.equal((await db.query("SELECT * FROM opportunity_evaluations")).rows.length, 1);
  });
  await check("database rejects missing, string, fractional and out-of-range ratings", async () => {
    for (const scores of [
      {},
      { demand: "3", growth: 3, fit: 3, feasibility: 3, resilience: 3 },
      { demand: 2.5, growth: 3, fit: 3, feasibility: 3, resilience: 3 },
      { demand: 6, growth: 3, fit: 3, feasibility: 3, resilience: 3 },
    ]) {
      await denied("UPDATE opportunity_evaluations SET scores=$1", [JSON.stringify(scores)]);
    }
  });
  await check("database rejects unsupported status", async () => {
    await denied("UPDATE opportunity_evaluations SET status='Admin'");
  });
  await check("evaluation identity cannot be reassigned", async () => {
    await denied("UPDATE opportunity_evaluations SET market_id='asia-water'");
  });
  await check("archived content cannot be changed, even during restore", async () => {
    await db.exec("UPDATE opportunity_evaluations SET status='Archived'");
    await denied("UPDATE opportunity_evaluations SET notes='tamper'");
    await denied("UPDATE opportunity_evaluations SET status='Researching', notes='tamper'");
    await db.exec("UPDATE opportunity_evaluations SET status='Researching'");
    await db.exec("UPDATE opportunity_evaluations SET notes='restored'");
  });
  await check("owner saves an immutable report", async () => {
    await db.query(
      "INSERT INTO market_analyses(user_id,market_id,scores,assumptions,report) VALUES ($1,'eu-heat-pumps',$2,'test assumptions',$3)",
      [alice, score, JSON.stringify({ mode: "Rule-based demo — no language model called" })],
    );
    await denied("UPDATE market_analyses SET assumptions='tamper'");
    await denied("DELETE FROM market_analyses");
    await denied(
      "INSERT INTO market_analyses(user_id,market_id,scores,assumptions,report) VALUES ($1,'eu-heat-pumps',$2,'test','{}')",
      [alice, score],
    );
  });
  await asUser(bob);
  await check(
    "second user cannot read another user's evaluations, analyses or profile",
    async () => {
      assert.equal((await db.query("SELECT * FROM opportunity_evaluations")).rows.length, 0);
      assert.equal((await db.query("SELECT * FROM market_analyses")).rows.length, 0);
      assert.equal((await db.query("SELECT * FROM profiles")).rows[0].id, bob);
    },
  );
  await check("second user cannot write under another user's identity", async () => {
    await denied(
      "INSERT INTO opportunity_evaluations(user_id,market_id,scores) VALUES ($1,'asia-water',$2)",
      [alice, score],
    );
    await denied(
      "INSERT INTO market_analyses(user_id,market_id,scores,assumptions,report) VALUES ($1,'asia-water',$2,'test',$3)",
      [alice, score, JSON.stringify({ mode: "Rule-based demo — no language model called" })],
    );
    assert.equal(
      (await db.query("UPDATE opportunity_evaluations SET notes='attack' RETURNING *")).rows.length,
      0,
    );
  });
  await db.exec("RESET ROLE; SET ROLE anon");
  await check("anonymous users cannot read private records", async () => {
    await denied("SELECT * FROM opportunity_evaluations");
    await denied("SELECT * FROM market_analyses");
  });
  await asUser(alice);
  await check("owner retrieves persisted records after identity switches", async () => {
    assert.equal(
      (await db.query("SELECT notes FROM opportunity_evaluations")).rows[0].notes,
      "restored",
    );
    assert.equal(
      (await db.query("SELECT assumptions FROM market_analyses")).rows[0].assumptions,
      "test assumptions",
    );
  });
  console.log(`${checks} isolated database checks passed. Hosted Supabase was not contacted.`);
} finally {
  await db.close();
}
