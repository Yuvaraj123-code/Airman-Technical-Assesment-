const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listAudit = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, 'Audit logs are a Level 2 deliverable', []));
});

module.exports = { listAudit };
