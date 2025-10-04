import 'dotenv/config';
import { connectMongo, connectPostgres } from '../src/config/db';
import { Dataset } from '../src/models/Dataset';
import { Experiment, AstronautHealth, syncSqlModels } from '../src/models/sql';

async function seedMongo() {
  console.log('[seed] Seeding MongoDB datasets...');
  const samples = [
    { source: 'GeneLab', type: 'genomics', title: 'ISS Plant Growth 2024' },
    { source: 'GeneLab', type: 'transcriptomics', title: 'Mouse Muscle Atrophy Study' },
    { source: 'NBISC', type: 'specimen_data', title: 'Drosophila Microgravity Response' },
    { source: 'OpenData', type: 'environmental', title: 'ISS Cabin Environmental Log' },
    { source: 'PDS', type: 'space_environment', title: 'Solar Wind Particles 2023' },
  ];

  await Dataset.deleteMany({});
  await Dataset.insertMany(samples);
  const count = await Dataset.countDocuments({});
  console.log(`[seed] Inserted ${count} datasets`);
}

async function seedPostgres() {
  console.log('[seed] Seeding PostgreSQL experiments and astronaut health...');

  await Experiment.destroy({ where: {} });
  await AstronautHealth.destroy({ where: {} });

  await Experiment.bulkCreate([
    { organism: 'mouse', mission: 'ISS', type: 'transcriptomics', duration_days: 30 },
    { organism: 'arabidopsis', mission: 'ISS', type: 'genomics', duration_days: 20 },
    { organism: 'human', mission: 'Artemis III', type: 'proteomics', duration_days: 10 },
  ]);

  await AstronautHealth.bulkCreate([
    { astronaut_id: 'astro-1', hr: 62, bp: '118/75' },
    { astronaut_id: 'astro-1', hr: 64, bp: '121/79' },
    { astronaut_id: 'astro-2', hr: 58, bp: '115/73' },
  ]);

  const expCount = await Experiment.count();
  const healthCount = await AstronautHealth.count();
  console.log(`[seed] Inserted ${expCount} experiments, ${healthCount} health records`);
}

(async () => {
  try {
    await connectMongo();
    await connectPostgres();
    await syncSqlModels();

    await seedMongo();
    await seedPostgres();

    console.log('[seed] Done.');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exit(1);
  }
})();
