const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const languages = require("../docker/languages");
const projectRoot = path.join(__dirname, "../..");

const runExecutable = (
  executablePath,
  input,
  language,
  requestId,
  memoryLimit,
  timeLimit
) => {
  const memoryLimitMb = Number(memoryLimit);
  const timeLimitMs = Number(timeLimit);

  if (!Number.isSafeInteger(memoryLimitMb) || memoryLimitMb <= 0) {
    return Promise.reject({
      type: "RUNTIME_ERROR",
      message: "Problem memory limit must be a positive integer in MB",
    });
  }

  if (!Number.isSafeInteger(timeLimitMs) || timeLimitMs <= 0) {
    return Promise.reject({
      type: "RUNTIME_ERROR",
      message: "Problem time limit must be a positive integer in milliseconds",
    });
  }

  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const tempDir = path.join(projectRoot, "temp", requestId);
    const inputFile = path.join(tempDir, "input.txt");

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(inputFile, input);

    const config = languages[language];
    const timeLimitSeconds = timeLimitMs / 1000;

    const dockerCommand =
      `docker run --rm \
--network=none \
--memory=${memoryLimitMb}m \
--cpus=1 \
--pids-limit=64 \
--user 1000:1000 \
--read-only \
--security-opt=no-new-privileges \
--mount "type=bind,source=${tempDir.replace(/\\/g, "/")},target=/code" \
${config.runImage} \
bash -c "timeout --signal=TERM ${timeLimitSeconds}s ${config.run} < /code/input.txt"`;

    exec(
      dockerCommand,
      {
        timeout: timeLimitMs + 30000,
      },
      (error, stdout, stderr) => {

        if (error) {
          if (error.code === 124) {
            console.log("Time Limit Exceeded");

            return reject({
              type: "TIME_LIMIT_EXCEEDED",
              message: `Execution exceeded ${timeLimitMs} ms`,
            });
          }

          if (error.killed) {
            return reject({
              type: "RUNTIME_ERROR",
              message: "Execution runner did not respond before its safety timeout",
            });
          }

          // Memory Limit
          if (error.code === 137 || stderr.includes("Killed")) {
            console.log("Memory Limit Exceeded");

            return reject({
              type: "MEMORY_LIMIT_EXCEEDED",
              message: stderr,
            });
          }

          console.log("Runtime Error");
          console.log(stderr);

          const diagnostic = stderr.trim();
          const exitDetails = [
            error.code != null ? `exit code ${error.code}` : null,
            error.signal ? `signal ${error.signal}` : null,
          ].filter(Boolean).join(", ");

          return reject({
            type: "RUNTIME_ERROR",
            code: error.code,
            message: diagnostic || `Program failed without error output (${exitDetails || "unknown exit status"})`,
          });
        }

        const endTime = Date.now();
        resolve({
          output: stdout.trim(),
          executionTime: endTime - startTime,
        });
      }
    );
  });
};

module.exports = {
  runExecutable,
};
