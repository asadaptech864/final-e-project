import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary'


    // Configuration
    cloudinary.config({ 
        cloud_name: 'dub4jt7ja', 
        api_key: '555944947235632', 
        api_secret: 'cTT8HeX8Tqd2yL02xI_Fq7EbeSc' // Click 'View API Keys' above to copy your API secret
    });
    
   console.log(cloudinary.config());

   const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'my_images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'jfif'],
    }
   });

   export const upload = multer({ storage });