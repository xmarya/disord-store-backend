type Success<T> = {
    success:true,
    data:T,
    error?:never
}

type Failure = {
    success:false
    error:Error,
    data?:never
}

type Result<T> = Success<T> | Failure;

async function tryCatch<T>(fun:Promise<T> ):Promise<Result<T>> {
    try {
        const data = await fun;
        return {success:true, data,}
    } catch (error) {
        console.log("tryCatch catch block error => ", error);
        // return {success:false, error} as Failure;
        return {success:false, error: error as Error};
    }

}

export default tryCatch;
