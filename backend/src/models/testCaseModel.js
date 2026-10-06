const pool = require("../config/db");

const createTestCase = async (
  problemId,
  input,
  expectedOutput,
  isSample
) => {
  const query = `
    INSERT INTO test_cases
    (problem_id, input, expected_output, is_sample)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const result = await pool.query(query, [
    problemId,
    input,
    expectedOutput,
    isSample,
  ]);

  return result.rows[0];
};
const getTestCasesByProblemId = async (
  problemId
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM test_cases
    WHERE problem_id = $1
    ORDER BY id;
    `,
    [problemId]
  );

  return result.rows;
};

const updateTestCase = async (
  problemId,
  testCaseId,
  input,
  expectedOutput,
  isSample
) => {
  const result = await pool.query(
    `UPDATE test_cases
     SET input = $1, expected_output = $2, is_sample = $3
     WHERE problem_id = $4 AND id = $5
     RETURNING *`,
    [input, expectedOutput, isSample, problemId, testCaseId]
  );

  return result.rows[0];
};

const deleteTestCase = async (problemId, testCaseId) => {
  const result = await pool.query(
    `DELETE FROM test_cases
     WHERE problem_id = $1 AND id = $2
     RETURNING *`,
    [problemId, testCaseId]
  );

  return result.rows[0];
};

module.exports = {
  createTestCase,
  getTestCasesByProblemId,
  updateTestCase,
  deleteTestCase,
};
