const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIAW3MD7DMSQVOMRIG5',
        secretAccessKey:'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',
    }
})



async function init() {

    console.log("Executing script.js");

    const outDirPath = path.join(__dirname,'output');

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data',(data) => {
        console.log(data.toString())

    })

    p.stdout.on('error',(data) => {
        console.log('Error',data.toString())
    })

    p.on('close', async () => {

        console.log('Build Compelete')

        const distFolderPath = path.join(__dirname,'output','dist')

        const distFolderContent = fs.readdirSync( distFolderPath , { recursive:true } ) //I can even use await readdir search about it

        for (const filePath of distFolderContent) {

            if (fs.lstatSync( filePath ).isDirectory()) {
                continue;
            }
            console.log("Uploading...",filePath);

            const command = new PutObjectCommand( {
                Bucket:'',
                Key: `__outputs/${PROJECT_ID}/${filePath}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath),
            })

            await s3Client.send(command);
        }
        console.log("Done");
    })

}

init();