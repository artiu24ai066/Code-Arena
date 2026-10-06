const pool = require("../config/db");

const createProblem = async (
  title,
  description,
  difficulty,
  createdBy,
  metadata = {}
) => {
  const query = `
    INSERT INTO problems
    (
      title, description, difficulty, created_by, tags, time_limit,
      memory_limit, input_format, output_format, constraints,
      sample_explanation, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    title,
    description,
    difficulty,
    createdBy,
    metadata.tags ?? [],
    metadata.timeLimit ?? 1000,
    metadata.memoryLimit ?? 256,
    metadata.inputFormat ?? "",
    metadata.outputFormat ?? "",
    metadata.constraints ?? "",
    metadata.sampleExplanation ?? "",
    metadata.status ?? "draft",
  ]);

  return result.rows[0];
};

const getAllProblems = async () => {
  const result = await pool.query(
    "SELECT * FROM problems ORDER BY id DESC"
  );

  return result.rows;
};
const getProblemById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM problems WHERE id = $1",
    [id]
  );

  return result.rows[0];
};
const updateProblem = async (
  id,
  title,
  description,
  difficulty,
  metadata = {}
) => {
  const result = await pool.query(
    `UPDATE problems
     SET title = $1,
         description = $2,
         difficulty = $3,
         tags = $4,
         time_limit = $5,
         memory_limit = $6,
         input_format = $7,
         output_format = $8,
         constraints = $9,
         sample_explanation = $10,
         status = $11
     WHERE id = $12
     RETURNING *`,
    [
      title,
      description,
      difficulty,
      metadata.tags ?? [],
      metadata.timeLimit ?? 1000,
      metadata.memoryLimit ?? 256,
      metadata.inputFormat ?? "",
      metadata.outputFormat ?? "",
      metadata.constraints ?? "",
      metadata.sampleExplanation ?? "",
      metadata.status ?? "draft",
      id,
    ]
  );

  return result.rows[0];
};
const deleteProblem = async (id) => {
  const result = await pool.query(
    "DELETE FROM problems WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};
module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};

