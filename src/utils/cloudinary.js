import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRIET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null

    //upload the file on cloudinary
    const uploadFile = await cloudinary.uploader.upload(localFilePath, 
        {
            resource_type:"auto"
        })

    console.log('file is uploaded on cloudinary');
    return uploadFile
  } catch (error) {
    fs.unlinkSync(localFilePath)
    console.log('getting error');
    return null
    
  }
}

export { uploadOnCloudinary }
