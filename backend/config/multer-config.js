const multer= require('multer');
const Storage= multer.memoryStorage();

const upload= multer({storage: Storage});

module.exports= upload;