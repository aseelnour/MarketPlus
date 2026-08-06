import axios from "axios";

const API = process.env.API_URL || "http://localhost:5000/api";

async function check(path: string) {
  const url = `${API}${path}`;
  try {
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`OK ${path} -> ${res.status}`);
    return true;
  } catch (err: any) {
    console.error(`FAIL ${path} -> ${err.message}`);
    return false;
  }
}

(async () => {
  console.log("Running smoke tests against", API);
  const paths = [
    "/customers/products?limit=1",
    "/customers/stores/featured?limit=1",
    "/customers/stats/home",
    "/customers/products/categories",
  ];

  const results = await Promise.all(paths.map((p) => check(p)));
  const ok = results.every(Boolean);
  if (!ok) {
    console.error("Smoke tests failed");
    process.exit(1);
  }
  console.log("Smoke tests passed");
  process.exit(0);
})();
