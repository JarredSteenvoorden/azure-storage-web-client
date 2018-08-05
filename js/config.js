
// User config
let heading = location.host;
let accountName = '';
let containers = [ '' ];

// No need to change these for anonymous access
let blobUri = 'https://' + accountName + '.blob.core.windows.net';
let service = AzureStorage.Blob.createBlobServiceAnonymous(blobUri);
//let service = AzureStorage.Blob.createBlobService(accountName, 'key');
