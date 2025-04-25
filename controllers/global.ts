import { model } from "mongoose";
import { catchAsync } from "../_utils/catchAsync";
import { DOCS_PER_PAGE } from "../_data/constants";
import { Model } from "../_Types/Model";
import { AppError } from "../_utils/AppError";
import sanitisedData from "../_utils/sanitisedData";

export const getAll = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("getAll");
    const docs = await model(Model).find().limit(DOCS_PER_PAGE); //TODO: pages functionality

    if (!docs) return next(new AppError(400, "No data found."));

    response.status(200).json({
      success: true,
      result: docs.length,
      data: docs,
    });
  });

export const getOne = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("getOne");

    const docId = request.params.id || request.params.storeId;
    if (!docId) return next(new AppError(400, "document id is missing."));

    const doc = await model(Model).findById(docId);
    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(200).json({
      success: true,
      data: doc,
    });
  });

export const updateOne = (Model: Model) =>
  catchAsync(async (request, response, next) => {
    console.log("updateOne");
    sanitisedData(request, next);

    const docId = request.params.id || request.params.storeId;
    if (!docId) return next(new AppError(400, "document id is missing."));

    const updatedData = request.body;
    if (!updatedData) return next(new AppError(400, "request.body is missing"));

    const doc = await model(Model).findByIdAndUpdate(docId, updatedData, { new: true, runValidators: true });

    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(200).json({
      success: true,
      data: doc,
    });
  });

export const deleteOne = (Model: Exclude<Model, "User">) =>
  catchAsync(async (request, response, next) => {
    console.log("deleteOne");
    const docId = request.params.id || request.params.storeId;
    if (!docId) return next(new AppError(400, "document id is missing."));

    const doc = await model(Model).findByIdAndDelete(docId);

    if (!doc) return next(new AppError(404, "No document is associated with this id"));

    response.status(204).json({
      success: true,
      data: null,
    });
  });
