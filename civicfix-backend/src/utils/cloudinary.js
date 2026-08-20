const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer) => {

    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "civicfix/complaints",
                resource_type: "image"
            },
            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        uploadStream.end(buffer);
    });
};

module.exports = {
    uploadImage
};