import { Router } from "express";
const router: Router = Router();
import * as UserController from "../Controllers/UserController";

//create user
router.post("/", UserController.createUser);

//get user
// router.get("/:userId", UserController.getUser);

//update user
router.patch("/", UserController.updateUser);

// get all user
router.get("/", UserController.getAllUser);

//update user
router.get("/top/:top", UserController.topKUser);

export default router;
