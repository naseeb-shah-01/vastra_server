import express from "express";

import {
  addRequest,
  changeStatus,
  downloadRequests,
  downloadRequestsView,
  searchRequests,
  shareRequests,
} from "../app/controllers/query.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", addRequest);
router.get("/search", authenticate, searchRequests);
router.post("/share", authenticate, shareRequests);
router.get("/download",authenticate, downloadRequests);
router.get("/search-download",authenticate, downloadRequestsView);
router.get("/status/:id/:status",authenticate, changeStatus);


export default router;
