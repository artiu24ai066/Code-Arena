const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const languages = require("../docker/languages");
const projectRoot = path.join(__dirname, "../..");

const runExecutable = (
  executablePath,
  input,language = "cpp",
  requestId
) => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const tempDir = path.join(projectRoot, "temp", requestId);
    const inputFile = path.join(tempDir, "input.txt");

    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(inputFile, input);

    const config = languages[language];

    const dockerCommand =
      `docker run --rm \
--network=none \
--memory=128m \
--cpus=1 \
--pids-limit=64 \
--user 1000:1000 \
--read-only \
--security-opt=no-new-privileges \
--mount "type=bind,source=${tempDir.replace(/\\/g, "/")},target=/code" \
${config.runImage} \
bash -c "${config.run} < /code/input.txt"`;

    exec(
      dockerCommand,
      {
        timeout: 2000,
      },
      (error, stdout, stderr) => {

        if (error) {
          // Time Limit
          if (error.killed) {
            console.log("Time Limit Exceeded");

            return reject({
              type: "TIME_LIMIT_EXCEEDED",
              message: "Execution exceeded 2 seconds",
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

          return reject({
            type: "RUNTIME_ERROR",
            code: error.code,
            message: stderr,
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
