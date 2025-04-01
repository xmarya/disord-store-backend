import { createOne, deleteOne, updateOne } from "./global";

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
export const createCategory = createOne("Category");
export const updateCategory = updateOne("Category");
export const deleteCategory = deleteOne("Category");

