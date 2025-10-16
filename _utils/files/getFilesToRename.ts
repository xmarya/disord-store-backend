

const getFilesToRename = (resourceId: string, filesUrl: Array<string | undefined>) => filesUrl.filter((url) => url && !url.includes(resourceId)) as Array<string>;


export default getFilesToRename