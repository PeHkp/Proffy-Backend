import express from "express";

import UserController from "./controllers/UserController"

import ConnectionsController from "./controllers/ConnectionsController"

const ControllerUser = new UserController()

const ControllerConnections = new ConnectionsController()

const routes = express.Router();

routes.post("/create-classes",ControllerUser.create)
routes.get("/list-classes",ControllerUser.index)

routes.post("/connectios",ControllerConnections.create)
routes.get("/connectios",ControllerConnections.index)

export default routes;