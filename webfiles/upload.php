<?php
// Last modified: 2023/02/16 17:26:53

/*
******** PHP Upload script for Cumulus MX ********

Use as an alternative to FTP/SFTP upload of data

Mark Crossley - 2023

*/

// *** YOU NEED TO CHANGE THIS VALUE ***
// Our signature secret
$secret = 'change_this_to_the_value_in_CMX';

// limitPath: restricts the upload script to placing files in the same folder structure as the script resides
// That is you cannot specify something like /etc/init.d/sudo as a filename
// Setting this to false allows the script to attempt to write anywhere in your filesystem that it has permission
$limitPath = true;

// logs additional information to the reponses sent back to CMX, do not enable unless asked
$debug = false;


// *****************************************
// *** DO NOT CHANGE ANYTHING BELOW HERE ***
// *****************************************


if ($secret === 'change_this_to_the_value_in_CMX') {
    echo 'You must change the default secret';
    http_response_code(500);
    exit;
}

if ($debug) {
    $headers =  getallheaders();
    foreach($headers as $key=>$val){
    echo "$key: $val\n";
    }
    echo 'CWD = '.getcwd()."\n";
}

// first check for GET/POST
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // used for testing the compression response
?>
<html>
    <body>
        Welcome to upload.php<br>
<?php
    echo str_repeat("xx xx", 1000), "<br>"
?>
    </body>
</html>
<?php
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] != 'POST') {
    echo 'Error: Must use POST method';
    http_response_code(500);
    exit;
}

// ---------------------------------------------------------------
// Get all the mandatory data we need from the POST message
// ---------------------------------------------------------------

// We need a timestamp to check the signature and validity
$receivedTime = $_SERVER['REQUEST_TIME'];
if (isset($_SERVER['HTTP_TS'])) {
    $requestTime = $_SERVER['HTTP_TS'];
} else {
    echo 'Error: No timestamp';
    http_response_code(422);
    exit;
}

if (abs($receivedTime - $requestTime) > 10) {
    echo "Error: TimeStamp is out of date\n";
    echo "Data TS   = $requestTime\n";
    echo "Server TS = $receivedTime\n";
    http_response_code(422);
    exit;
}

// The signature to test
if (isset($_SERVER['HTTP_SIGNATURE'])) {
    $signatureSent = $_SERVER['HTTP_SIGNATURE'];
} else {
    echo 'Error: No signature';
    http_response_code(422);
    exit;
}

if (isset($_SERVER['HTTP_FILE'])) {
    $name = $_SERVER['HTTP_FILE'];

    // first check if the file is escaping our local folder structure
    if ($limitPath) {
        $name_dir = pathinfo($name)['dirname'];
        $name_fullpath = resolvePath($name_dir);
        $cwd = getcwd();

        if (substr($name_fullpath, 0, strlen($cwd)) !== $cwd) {
            echo "Error: Attempting to escape local folder structure\n";
            http_response_code(500);
            exit;
        }
    }

    // if the file exists, check the file is writable
    if (file_exists($name)) {
        if (!is_writable($name)) {
            echo "Error: Target file $name is not writable by this user " . `whoami`;
            http_response_code(500);
            exit;
        }
    } else {
        if (!touch($name)) {
            echo "Error: Cannot create the target file $name with this user " . `whoami`;
            http_response_code(500);
            exit;
        }
    }
} else {
    echo 'Error: No filename';
    http_response_code(422);
    exit;
}

// Now what are we doing with the file?
if (isset($_SERVER["HTTP_ACTION"])) {
    $action = $_SERVER['HTTP_ACTION'];
} else {
    echo 'Error: No action';
    http_response_code(422);
    exit;
}

if ($action !== 'replace' && $action !== 'append') {
    echo "Error: Invalid header ACTION = $action\n";
    http_response_code(422);
    exit;
}

// If appending - get the earlist timestamp - JS timestamps overflow PHP int!
if ($action === 'append') {
    if (isset($_SERVER['HTTP_OLDEST'])) {
        $oldestTs = (float)$_SERVER['HTTP_OLDEST'];
    } else {
        echo 'Error: No oldest timestamp';
        http_response_code(422);
        exit;
    }
}


$binary = $_SERVER['HTTP_BINARY'];
if ($binary != '0' && $binary != '1') {
    echo "Error: Invalid header BINARY = $binary\n";
    http_response_code(422);
    exit;
}

if (isset($_SERVER['HTTP_RAW_POST_DATA'])) {
    $data = $_SERVER['HTTP_RAW_POST_DATA'];
} else {
    $data = file_get_contents('php://input');
}

if (strlen($data) == 0) {
    echo 'Error: No data sent';
    http_response_code(422);
    exit;
}

if (isset($_SERVER['HTTP_CONTENT_ENCODING'])) {
    if ($_SERVER['HTTP_CONTENT_ENCODING'] == 'gzip') {
        echo "Unzipping data\n";
        $data = gzdecode($data);
    } elseif ($_SERVER['HTTP_CONTENT_ENCODING'] == 'deflate') {
        echo "Inflating data\n";
        $data = gzinflate($data);
    }
}

if ($debug) {
    //echo "Data = $data\n";
}


// ---------------------------------------------------------------
// Check the signature sent matches what we calculate
// ---------------------------------------------------------------
$ourSignature = CalculateSignature($secret, $requestTime . $name . $data);
if ($signatureSent != $ourSignature) {
    echo "Error: Invalid signature\n";
    echo "Data Sig   = $signatureSent\n";
    echo "Server Sig = $ourSignature\n";
    echo "Server sig data = " . $requestTime . $name . substr($data, 0, 50);
    http_response_code(422);
    exit;
}


// ---------------------------------------------------------------
// Finally, do the processing
// ---------------------------------------------------------------

if ($action === 'replace') {
    // do we need to decode a base64 string back to binary data
    echo 'Opening ' . ($binary == '1' ? 'binary' : 'text') . " file $name for replacement\n";
    if ($binary == '1') {
        $data =  base64_decode($data);
    }
    WriteFile($name, $data, $binary == '1');
    exit;
} else if ($action === 'append') {
    // first check we have some data to append!
    $dataObj = json_decode($data, false);
    if (is_null($dataObj)) {
        echo "No valid JSON data in the received data\n";
        http_response_code(500);
        exit;
    }

    // next check we have an existing file to append
    // if not then just write the new data to a dest file
    echo "Opening text file $name for appending\n";
    if (!file_exists($name) || filesize($name) === 0) {
        echo "No existing file to append data - $name\n";
        WriteFile($name, $data);
        exit;
    }

    // open the target file for reading
    if (!$outFile = fopen($name, 'r')) {
        echo "Failed to open file $name";
        http_response_code(500);
        exit;
    }

    $fileObj = json_decode(fgets($outFile), false);
    fclose($outFile);

    // no valid data in the dest file
    if (is_null($fileObj)) {
        echo "No valid JSON data in - $name\n";
        echo "Writing data as a new file\n";
        WriteFile($name, $data);
        exit;
    }

    if ($debug) {
        echo "New data:\n";
        var_dump($dataObj);
        echo "\n";
    }

    // remove the old data
    foreach ($fileObj as $key => $val) {
        if (is_null($val)) {
            continue;
        }

        // $val format is [[ts,val],[ts,val]...]
        if ($debug) {
            echo "Processing entry $key\n";
        }

        $arr = $val;
        do {
            if (sizeof($arr) > 0 && $arr[0][0] < $oldestTs) {
                if ($debug) {
                    echo "Removing entry $key - ".$arr[0][0]."\n";
                }
                array_shift($arr);
            } else {
                break;
            }
        } while(true);
        $fileObj->$key = $arr;
    }

    // append the new data
    foreach ($dataObj as $key => $val) {
        if (is_null($val)) {
            continue;
        }

        if ($debug) {
            echo "Appending new data: $key - ".sizeof($val)."\n";
        }

        if (sizeof($val) > 0) {
            $fileObj->$key = array_merge($fileObj->$key,  $val);
        }
    }

    // write the file back again
    echo "Appending text file $name\n";
    WriteFile($name, json_encode($fileObj));

} else {
    echo 'Error: Invalid action'. $action;
    http_response_code(422);
    exit;
}


// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function CalculateSignature($secret, $data) {
    return hash_hmac('sha256', $data, $secret, false);
}


function WriteFile($filename, $content, $binary=false) {
        // open the target file for writing
        $mode = 'w' . ($binary ? 'b': '');

        $outFile = fopen($filename, $mode) or die("Cannot create file $filename with mode $mode");
        if (!$outFile) {
            echo "Failed to open file $filename - mode $mode";
            http_response_code(500);
            exit;
        }

        echo 'Writing ' . ($binary ? 'binary': 'text') . " file $filename\n";

        if (fwrite($outFile, $content) == FALSE) {
            echo "Write failed";
            http_response_code(500);
        } else {
            echo 'Write complete';
        }

        fclose($outFile);
}

set_exception_handler(function($ex) {
    echo "\nException occurred!\n\n";
    echo print_r($ex);
    http_response_code(500);
    exit;
});


function resolvePath($path) {
    if(DIRECTORY_SEPARATOR !== '/') {
        $path = str_replace(DIRECTORY_SEPARATOR, '/', $path);
    }
    $search = explode('/', $path);
    $search = array_filter($search, function($part) {
        return $part !== '.';
    });
    $append = array();
    $match = false;
    while(count($search) > 0) {
        $match = realpath(implode('/', $search));
        if($match !== false) {
            break;
        }
        array_unshift($append, array_pop($search));
    };
    if($match === false) {
        $match = getcwd();
    }
    if(count($append) > 0) {
        $match .= DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $append);
    }
    return $match;
}