import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: "dvtyyd1rv", 
    api_key: "853392538367718", 
    api_secret:"uCt2_4AkqXJzTndsdd6VVmgPvg4"
});




const uplodeFileToCloudinary = async(localFilePath) => {

    try {
        if(!localFilePath) return null;

        // console.log(localFilePath);
        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        console.log('file is uploaded', response.url);
        fs.unlinkSync(localFilePath)
        return response
        

    } catch (error) {
        console.log('Fail in upload to cloud');
        fs.unlinkSync(localFilePath)

    }
  
}

export { uplodeFileToCloudinary }
