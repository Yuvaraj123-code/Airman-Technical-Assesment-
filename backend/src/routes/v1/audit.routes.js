const express = require('express');
const controller = require('../../controllers/audit.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { allowRoles } = require('../../middleware/rbac.middleware');
const { ROLES } = require('../../utils/constants');

const router = express.Router();

router.get('/', authMiddleware, allowRoles(ROLES.ADMIN), controller.listAudit);

module.exports = router;
