import mammoth from "mammoth";

export const ConvertToHtml = async (Doc:ArrayBuffer) =>{
    const message = await mammoth.convertToHtml({
        arrayBuffer:Doc
    })
    console.log(message);
    return message
}