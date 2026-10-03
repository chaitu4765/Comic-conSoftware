const { spawn } = require("child_process");

const major = Number(process.versions.node.split(".")[0]);
const env = { ...process.env };

if (major >= 17 && !(env.NODE_OPTIONS || "").includes("--openssl-legacy-provider")) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, "--openssl-legacy-provider"].filter(Boolean).join(" ");
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/with-openssl.js <command> [args...]");
  process.exit(1);
}

const child = spawn(args[0], args.slice(1), { stdio: "inherit", env });
child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code == null ? 1 : code);
});
