const busboy = require('busboy')
const iptcParser = require('node-iptc')

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function handler(event, context) {
  const contentType = event.headers['Content-Type'] || event.headers['content-type']
  const bb = new busboy({ headers: { 'content-type': contentType }})

  const results = [];
  bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype)
    
    file.buff = []

    file
    .on('data', function(data) {
        console.log('File [%s] got %d bytes', fieldname, data.length)
        this.buff[this.buff.length] = data
    })
    .on('end', function() {
        console.log('File [%s] Finished', fieldname)
        const buffer = Buffer.concat(this.buff)
        const fileParsed = {
          name: filename,
          mimetype: fileData.mimetype,
          iptc: iptcParser(buffer)
        }
        results.push(iptc)
    })
  })
  .on('field', (fieldname, val) =>console.log('Field [%s]: value: %j', fieldname, val))
  .on('finish', () => {
    console.log('Done parsing form!')
    context.succeed({ statusCode: 200, body: JSON.stringify(results), headers, "isBase64Encoded": false })
  })
  .on('error', err => {
    console.log('failed', err)
    context.fail({ statusCode: 500, body: err, headers, "isBase64Encoded": false })
  })

  bb.end(event.body, event.isBase64Encoded ? 'base64' : 'binary')
}

module.exports = { handler }