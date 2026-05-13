import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { env } from './env.js';

const s3 = new S3Client({
  region: env.AWS.REGION,
  credentials: {
    accessKeyId: env.AWS.ACCESS_KEY,
    secretAccessKey: env.AWS.SECRET_KEY,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: env.AWS.BUCKET,
    // Removing acl: 'public-read' as it often causes 403 errors with modern S3 settings
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const folder = req.params.folder || 'misc';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

export default s3;
