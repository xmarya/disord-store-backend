
type RequiredField = {
    required:boolean,
    requiredMessage:string
}

export type FormFields = {
    label: {
        text:string,
        htmlFor:string
    },
    input: {
        name:string,
        type:string,
        placeholder:string,
        required?:RequiredField
    }
}