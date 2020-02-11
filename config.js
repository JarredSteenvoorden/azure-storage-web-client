
// User config
let heading = location.host;
let accountName = '';
let containers = [ '' ];
let donwloadUri = '';

let blobUri = 'https://' + accountName + '.blob.core.windows.net';

// No need to change these for anonymous access
let service = AzureStorage.Blob.createBlobServiceAnonymous(blobUri);
//let service = AzureStorage.Blob.createBlobService(accountName, 'key');
