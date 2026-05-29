import { seedEndoFiles } from './src/services/seedService.js';

async function test() {
  try {
    const res = await seedEndoFiles();
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
