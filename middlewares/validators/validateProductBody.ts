import { DigitalProduct, PhysicalProduct, ProductDataBody } from "@Types/Product";
import { AppError } from "@utils/AppError";
import { catchAsync } from "@utils/catchAsync";

export const validateProductBody = catchAsync(async (request, response, next) => {
  const { productType, name, price, description }: ProductDataBody = request.body;
  if (!name?.trim() || !productType?.trim() || !price || !description?.trim())
    return next(new AppError(400, "Please provide all necessary product data and specify the productType to be either physical or digital."));

  if (productType === "digital") {
    const { fileName, filePath, fileSize }: DigitalProduct = request.body;
    if (!name?.trim() || !price || !description?.trim() || !fileName?.trim() || !filePath?.trim() || !fileSize?.trim())
      return next(new AppError(400, "Please provide all necessary digital product data (name, price, description, fileName, filePath, fileSize)"));
  } else if (productType === "physical") {
    const { weight }: PhysicalProduct = request.body;
    if (!weight) return next(new AppError(400, "Please specify the product's weight"));
  } else return next(new AppError(400, "Invalid productType. Must be either 'digital' or 'physical'."));

  next();
});
