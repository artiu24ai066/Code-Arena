const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const languages = require("../docker/languages");

const compileCode = (
  code,
  language = "cpp",
  requestId
) => {
  return new Promise((resolve, reject) => {
    const config = languages[language];

    const projectRoot = path.join(__dirname, "../..");
    const tempDir = path.join(projectRoot, "temp", requestId);
    const fileName = language === "java" ? "Main.java" : `main.${config.extension}`;
    const sourceFile = path.join(tempDir, fileName);
    const executable = path.join(tempDir, "main");
    const dockerMount = `type=bind,source=${tempDir.replace(/\\/g, "/")},target=/code`;

    fs.mkdirSync(tempDir, { recursive: true });

    fs.writeFileSync(sourceFile, code);

    // Python doesn't need compilation
    if (!config.compiled) {
      return resolve(executable);
    }

    exec(
      `docker run --rm --mount "${dockerMount}" ${config.compileImage} ${config.compile}`,
      (error, stdout, stderr) => {
        if (error) {
          const compilationOutput = stderr || error.message;
          console.log("Compilation Failed");
          console.log(compilationOutput);

          return reject({
            type: "COMPILATION_ERROR",
            message: compilationOutput,
          });

        }

        resolve(executable);
      }
    );
  });
};

module.exports = {
  compileCode,
};
