let container = '';
let prefix = '';
let dataTable = null;

$(document).ready(function () {
    // Setup data table
    dataTable = $('#data-table').DataTable({
        ordering: true,
        searching: false,
        paging:   false,
        info:     false,
        columns: [
            { data: "name", type: "directory-file" },
            { data: "size", type: "file-size" },
            { data: "lastModified", type: "date" }
        ],
        language: {
            emptyTable: "Empty Folder",
        }
    });

    loadPathFromUrl();
});

// Called on browser back button
window.onpopstate = function(event) {
    loadPathFromUrl();
};

// Load files from url in the format
// https://domain/#/container/path/to/directory
function loadPathFromUrl() {
    loadPath(window.location.hash.replace('#/', ''), false);
}

function loadPath(path, addHistory) {
    if (path === undefined) path = '';
    if (addHistory === undefined) addHistory = true;

    // Break path up into container and prefix
    if (path === '/') path = '';
    container = path.split('/')[0];
    prefix = path.split('/').slice(1, -1).join('/') + '/';
    if (prefix === '/') prefix = '';

    // Add path to title
    document.title = heading + ' /' + path;

    // Create path links
    let pathLink = createFolderLink('home/', '');
    let pathParts = path.split('/').slice(0,-1);
    for (let i = 0; i < pathParts.length; i++) {
        let pathPrefix = pathParts.slice(0, i + 1).join('/') + '/';
        pathLink += createFolderLink(pathParts[i] + '/', pathPrefix);
    }
    document.getElementById('path').innerHTML = pathLink;

    // Create back link
    let backPath = path.split('/').slice(0,-2).join('/') + '/';
    document.getElementById('controls').innerHTML =
        createFolderLink('Back', backPath) + ' - ' +
        createFolderLink('Refresh', path);

    dataTable.clear();

    if (container.length === 0) {
        // Show containers list if one isn't yet selected
        for (let i = 0; i < containers.length; i++) {
            dataTable.row.add({
                name: createFolderLink(containers[i] + '/', containers[i] + '/'),
                size: '',
                lastModified: ''
            });
        }
        dataTable.draw();
    } else {
        // Load container contents
        loadFolders();
        loadFiles();
    }

    // Push new path onto the history
    if (addHistory)
        history.pushState(path, document.title, "#/" + path);
}

function loadFolders() {
    service.listBlobDirectoriesSegmentedWithPrefix(container, prefix, null, {delimiter: '/'}, function (error, results) {
        if (error) {
            alert('List blob error, please open browser console to view detailed error');
            console.log(error);
        } else {
            for (var i = 0, blob; blob = results.entries[i]; i++) {
                dataTable.row.add({
                    name: createFolderLink(blob.name.replace(prefix,''), container + '/' + blob.name),
                    size: '',
                    lastModified: ''
                });
            }

            dataTable.draw();
        }
    });
}

function loadFiles() {
    service.listBlobsSegmentedWithPrefix(container, prefix, null, {delimiter: '/'}, function (error, results) {
        if (error) {
            alert('List blob error, please open browser console to view detailed error');
            console.log(error);
        } else {
            for (var i = 0, blob; blob = results.entries[i]; i++) {
                let lastModified = moment(blob.lastModified);

                dataTable.row.add({
                    name: '<a href="' + donwloadUri + '/' + container + '/' + blob.name + '">' + blob.name.replace(prefix, '') + '</a>',
                    size: humanFileSize(blob.contentLength, false),
                    lastModified: lastModified.format('YYYY-MM-DD hh:mm:ss A')
                });
            }

            dataTable.draw();
        }
    });
}

function createFolderLink(text, path) {
    return '<a href="#/' + path + '" onclick="loadPath(\'' + path + '\'); return false;">' + text + '</a>';
}

$.fn.dataTable.ext.type.order['directory-file-pre'] = function ( data ) {

    // Remove link code
    let div = document.createElement("div");
    div.innerHTML = data;
    data = div.textContent || div.innerText || "";

    if (data.includes('/'))
        return '/' + data;

    return data;
};

$.fn.dataTable.ext.type.order['file-size-pre'] = function ( data ) {
    if (data.length === 0)
        return -1;

    var units = data.replace(/[\d\.]/g, '').trim().toLowerCase();
    var multiplier = 1;

    if ( units === 'kib' ) {
        multiplier = 1024;
    }
    else if ( units === 'mib' ) {
        multiplier = 1024*1024;
    }
    else if ( units === 'gib' ) {
        multiplier = 1024*1024*1024;
    }
    else if ( units === 'tib' ) {
        multiplier = 1024*1024*1024*1024;
    }

    return parseFloat(data) * multiplier;
};

function humanFileSize(bytes, si) {
    if (si === undefined) si = true;

    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

// Polyfills for IE
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}