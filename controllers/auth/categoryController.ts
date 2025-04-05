import { createCategory } from "../../_services/category/categoryService";
import { catchAsync } from "../../_utils/catchAsync";
import sanitisedData from "../../_utils/sanitisedData";
import { deleteOne, getOne, updateOne } from "../global";

/* OLD CODE (kept for reference): 
export const createCategory = catchAsync( async(request, response, next) => {
    const sanitisedData = request.body;
    
    if(sanitisedData === null || sanitisedData === undefined)
    return next(new AppError(400, "Invalid inputs"));
    
    const {name, colour, store}:Omit<CategoryBasic, "id"> = request.body;
    const newCategory = await Category.create({
        name,
        colour,
        store
    });
    
    response.status(201).json({
        status: "success",
        newCategory
    });
});

export const updateCategory = catchAsync( async(request, response, next) => {
    const sanitisedData = request.body;

    if(sanitisedData === null || sanitisedData === undefined)
        return next(new AppError(400, "Invalid inputs"));

    const {id, name, colour}:Partial<CategoryBasic> = request.body;
    const updatedCategory = await Category.findByIdAndUpdate(id, {
        name,
        colour
    });

    response.status(201).json({
        status: "success",
        updatedCategory
    });
});
*/

// protected
export const createCategoryController = catchAsync( async(request, response, next) => {

    //TODO check the plan quota:

    sanitisedData(request.body, next);
    const data = {...request.body, store: request.params.storeId};

    const newCategory = await createCategory(data);

    response.status(201).json({
        status: "success",
        newCategory
    });

});

export const getAllCategoriesController = catchAsync( async(request, response, next) => {});

export const getCategoryController = getOne("Category");
export const updateCategoryController = updateOne("Category");
export const deleteCategoryController = deleteOne("Category");

