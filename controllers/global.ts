import { model } from "mongoose";
import { catchAsync } from "../_utils/catchAsync";
import { DOCS_PER_PAGE } from "../_data/constants";
import { Model } from "../_Types/Model";
import { AppError } from "../_utils/AppError";
import xss from "xss";
import sanitisedData from "../_utils/sanitisedData";

export const createOne = (Model: Exclude<Model, "User" | "Store">) =>
  catchAsync(async (request, response, next) => {
    // NOTE: this controller is not for creating users
    console.log("createOne");
    sanitisedData(request, next);

    const data = request.body;
    const newDoc = await model(Model).create({ data });

    response.status(201).json({
      status: "success",
      newDoc,
    });
  });

export const getAll = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("getAll");
    const docs = await model(Model).find().limit(DOCS_PER_PAGE);

    response.status(200).json({
      status: "success",
      result: docs.length,
      data: docs,
    });
  });

export const getOne = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("getOne");

    const docId = request.params.id;
    const doc = await model(Model).findById(docId);

    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const updateOne = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("updateOne");
    sanitisedData(request, next);

    const docId = request.params.id;
    const updatedData = request.body;

    const doc = await model(Model).findByIdAndUpdate(docId, updatedData, { new: true, runValidators: true });

    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(200).json({
      status: "success",
      data: doc,
    });
  });

export const deleteOne = (Model: Exclude<Model, "User">) =>
  catchAsync(async (request, response, next) => {
    console.log("deleteOne");
    const docId = request.params.id;
    const doc = await model(Model).findByIdAndDelete(docId);

    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(204).json({
      status: "success",
      data: null,
    });
  });
