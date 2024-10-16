import {v2 as Cloudinary} from 'cloudinary'
import fs from 'fs'

Cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null

        //Upload the file to cloudinary
        const response = await Cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary",response.url)
        console.log(response)
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the  locally save tempory file  as the upload operation  
        return null
    }
}

const deleteOnCloudinary = async (item, type) => {
    if (!item) return null;

    //get their name for delete like publicId
    item=item.split("/")
    item=item[item.length-1]
    item=item.split(".")[0]
    console.log(item);
    try {
        const response = await Cloudinary.uploader.destroy(item, { resource_type: type,invalidate:true });
        console.log("File is deleted from Cloudinary", response);
        return response;
    } catch (error) {
        console.error("Error deleting file from Cloudinary", error);
        return null;
    }
};

// const updateOnCloudinary = async (item,title) => {
//     // !item? null :""
//     if (!item) return null;


//     //get their name for delete like publicId
//     // item=item.split("/")
//     // item=item[item.length-1]
//     // item=item.split(".")[0]
    
//     try {
//         console.log(item);
//         const sanitizedItem = item.replace(/\\/g, '/');
//         const response = await Cloudinary.api.update(sanitizedItem,{
//             tags:'thumbnail update',
//             context:`title=${title}`,
            
//         })
//         console.log("File is updated to Cloudinary", response);
//         return response;
//     } catch (error) {
//         console.error("Error updated file to Cloudinary", error);
//         return null;
//     }
// }

export {uploadOnCloudinary,deleteOnCloudinary}