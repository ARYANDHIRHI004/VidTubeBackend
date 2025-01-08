import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRIET
});


const uplodeFileToCloudinary = async(localFilePath) => {

    try {
        if(!localFilePath) return null;        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log('Fail in upload to cloud');
        fs.unlinkSync(localFilePath)
    } 
}

export { uplodeFileToCloudinary }
