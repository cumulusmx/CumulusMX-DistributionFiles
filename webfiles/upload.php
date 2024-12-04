<?php
$last_Modified="2024/11/28 17:56:02";
/*
******** PHP Upload script for Cumulus MX ********

Use as an alternative to FTP/SFTP upload of data

Mark Crossley - 2023-2024

*/

// *** YOU NEED TO CHANGE THIS VALUE *********
// My upload secret                          *
$secret = 'change_this_to_the_value_in_CMX';
//                                           *
// *******************************************

// limitPath: restricts the upload script to placing files in the same folder structure as the script resides
// Setting this to false allows the script to attempt to write anywhere in your filesystem that it has permission
$limitPath = true;

// logs additional information to the responses sent back to CMX, do not enable unless asked
$debug = false;


// *****************************************
// *** DO NOT CHANGE ANYTHING BELOW HERE ***
// *****************************************

ob_start();

if ($secret === 'change_this_to_the_value_in_CMX') {
    exitCode(500, 'You must change the default secret');
}

if ($debug) {
    foreach ($_SERVER as $name => $value) {
        echo $name, ': ', $value, "\n";
    }
    echo 'CWD = '.getcwd()."\n";
}

// first check for GET/POST
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_SERVER["HTTP_DATA"])) {
    // used for testing the compression response
?>
<html>
    <body>
        Welcome to upload.php<br>
<?php
    echo "Version: $last_Modified<br>";
    echo "Engine : " . phpversion() . "<br>";
    echo str_repeat("xx xx", 1000), "<br>\n";
?>
    </body>
</html>
<?php
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_SERVER["HTTP_DATA"])) {
    // We have data in the GET header
} elseif ($_SERVER['REQUEST_METHOD'] != 'POST') {
    exitCode(500, 'Error: Must use GET or POST method');
}

// ---------------------------------------------------------------
// Get all the mandatory data we need from the POST message
// ---------------------------------------------------------------

// We need a timestamp to check the signature and validity
$receivedTime = $_SERVER['REQUEST_TIME'];
if (isset($_SERVER['HTTP_TS'])) {
    $requestTime = $_SERVER['HTTP_TS'];
} else {
    exitCode(422, 'Error: No timestamp');
}

if (abs($receivedTime - $requestTime) > 20) {
    $msg = "Error: TimeStamp is out of date\n" .
        "Data TS   = $requestTime\n" .
        "Server TS = $receivedTime\n";
    exitCode(422, $msg);
}

// The signature to test
if (isset($_SERVER['HTTP_SIGNATURE'])) {
    $signatureSent = $_SERVER['HTTP_SIGNATURE'];
} else {
    exitCode(422, 'Error: No signature');
}

if (isset($_SERVER['HTTP_FILE'])) {
    $name = $_SERVER['HTTP_FILE'];

    // first check if the file is escaping our local folder structure
    $name_dir = pathinfo($name)['dirname'];
    if ($limitPath) {
        $name_fullpath = resolvePath($name_dir);
        $cwd = getcwd();

        if (substr($name_fullpath, 0, strlen($cwd)) !== $cwd) {
            exitCode(500, 'Error: Attempting to escape local folder structure');
        }
    }

    // check if the path exists
    if (!is_dir($name_dir)) {
        // try an create it
        echo "Creating folder $name_dir";
        mkdir($name_dir, 0777, true) or die("Cannot create required path $name_dir");
    }

    // if the file exists, check the file is writable
    if (file_exists($name)) {
        if (!is_writable($name)) {
            exitCode(500, "Error: Target file $name is not writable by this user " . `whoami`);
        }
    } else {
        if (!touch($name)) {
            exitCode(500, "Error: Cannot create the target file $name with this user " . `whoami`);
        }
    }
} else {
    exitCode(422, 'Error: No filename');
}

// Now what are we doing with the file?
if (isset($_SERVER["HTTP_ACTION"])) {
    $action = $_SERVER['HTTP_ACTION'];
    if ($action !== 'replace' && $action !== 'append') {
        exitCode(422, "Error: Invalid header ACTION = $action");
    }
} else {
    exitCode(422, 'Error: No action');
}

// set to 'logfile' for appending CSV log file data, 'json' for incremental Graph files
if ($action == 'append') {
    if (isset($_SERVER['HTTP_FILETYPE'])) {
        $fileType = $_SERVER['HTTP_FILETYPE'];
        if ($fileType !== 'logfile' && $fileType !== 'json') {
            exitCode(422, 'Error: Invalid file type = '. $fileType);
        }
    } else {
        // backwards compatibility for pre-incremental log files
        $fileType = 'json';
    }
}

// If appending - get the earlist timestamp - JS timestamps overflow PHP int!
if ($action === 'append' && $fileType === 'json') {
    if (isset($_SERVER['HTTP_OLDEST'])) {
        $oldestTs = (float)$_SERVER['HTTP_OLDEST'];
    } else {
        exitCode(422, 'Error: No oldest timestamp');
    }
}

// If appending to a log file, get the expected existing file length (in lines)
if ($action === 'append' && $fileType === 'logfile') {
    if (isset($_SERVER['HTTP_LINECOUNT'])) {
        $linecount = (int)$_SERVER['HTTP_LINECOUNT'];
    } else {
        exitCode(422, 'Error: No oldest timestamp');
    }
}

$utf8 = $_SERVER['HTTP_UTF8'];
if ($utf8 != '0' && $utf8 != '1') {
    // default to UTF-8 as before if not supplied
    $utf8 = '1';
}

$binary = $_SERVER['HTTP_BINARY'];
if ($binary != '0' && $binary != '1') {
    exitCode(422, "Error: Invalid header BINARY = $binary");
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = $_SERVER["HTTP_DATA"];
    // ALL (binary and text) GET data is encoded, only decode text before signature check
    if (!$binary) {
        $data =  base64_decode($data);
    }
} else {
    if (isset($_SERVER['HTTP_RAW_POST_DATA'])) {
        $data = $_SERVER['HTTP_RAW_POST_DATA'];
    } else {
        $data = file_get_contents('php://input');
    }

    if (strlen($data) == 0) {
        exitCode(422, 'Error: No data sent');
    }

    if (isset($_SERVER['HTTP_CONTENT_ENCODING'])) {
        if ($_SERVER['HTTP_CONTENT_ENCODING'] == 'br') {
            echo "Decompressing Brotli data\n";
            $data = brotli_uncompress($data);
        } elseif ($_SERVER['HTTP_CONTENT_ENCODING'] == 'gzip') {
            echo "Unzipping data\n";
            $data = gzdecode($data);
        } elseif ($_SERVER['HTTP_CONTENT_ENCODING'] == 'deflate') {
            echo "Inflating data\n";
            $data = gzinflate($data);
        }
    }
}

if ($debug) {
    echo "Data:\n" . substr($data, 0, 500) ."\n";
}

// ---------------------------------------------------------------
// Check the signature sent matches what we calculate
// ---------------------------------------------------------------
$ourSignature = CalculateSignature($secret, $requestTime . $name . $data);
if ($signatureSent != $ourSignature) {
    $msg = "Error: Invalid signature\n" .
        "Data Sig   = $signatureSent\n" .
        "Server Sig = $ourSignature\n" .
        "Server sig data = " . $requestTime . $name . substr($data, 0, 50);
    exitCode(422, $msg);
}

// change encoding if required
if ($utf8 == '0') {
    $data = mb_convert_encoding($data, "ISO-8859-1", "UTF-8");
}

// ---------------------------------------------------------------
// Finally, do the processing
// ---------------------------------------------------------------

if ($action === 'replace') {
    // do we need to decode a base64 string back to binary data
    echo 'Opening ' . ($binary == '1' ? 'binary' : 'text') . " file $name for replacement\n";
    // Binary POST data is encoded - we send it as text/plain
    if ($binary) {
        $data =  base64_decode($data);
    }
    WriteFile($name, $data, $binary == '1');
    exitCode(200);
} else if ($action === 'append') {
    if ($fileType === 'json') {
        AppendJsondata();
    } else if ($fileType === 'logfile') {
        AppendLogData();
    }
}

exitCode(200);

///////// end of script //////////

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function AppendJsondata() {
    global $data, $name, $debug, $oldestTs;

    // first check we have some data to append!
    $dataObj = json_decode($data, false);
    if (is_null($dataObj)) {
        exitCode(500, 'No valid JSON data in the received data');
    }

    // next check we have an existing file to append
    // if not then just write the new data to a dest file
    echo "Opening text file $name for appending\n";
    if (!file_exists($name) || filesize($name) === 0) {
        echo "No existing file to append data - $name\n";
        WriteFile($name, $data);
        exitCode(200);
    }

    // open the target file for reading
    if (!$outFile = fopen($name, 'r')) {
        exitCode(500, "Failed to open file $name");
    }

    $fileObj = json_decode(fgets($outFile), false);
    fclose($outFile);

    // no valid data in the dest file
    if (is_null($fileObj)) {
        echo "No valid JSON data in - $name\n";
        echo "Writing data as a new file\n";
        WriteFile($name, $data);
        exitCode(200);
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
            echo "Processing entry: $key\n";
        }

        $arr = $val;

        // test if the new data is older than latest value already in the file
        if (end($val)[0] > $dataObj->$key[0][0]) {
            exitCode(406, 'New data [' . $dataObj->$key[0][0] .'] is older than the existing data ['. end($val)[0] . ']');
        }

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
}

function AppendLogData() {
    global $data, $name, $linecount;

    // first check we have some data to append!
    if ($data == '') {
        exitCode(500, 'No data received');
    }

    // next check we have an existing file to append
    // if not then just write the new data to a dest file
    echo "Opening text file $name for appending\n";
    if (!file_exists($name) || filesize($name) === 0) {
        echo "No existing file to append data - $name\n";
        WriteFile($name, $data);
        exitCode(200);
    }

    // test if the file is already the correct length (lines)
    $file = new \SplFileObject($name);
    while($file->valid()) $file->fgets();
    if ($file->key() > $linecount + 1) {
        exitCode(406, "The file [$name] has [" . $file->key() . "] lines, should be [$linecount]");
    }
    $file = null;

    // append the new data
    AppendFile($name, $data);
}

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

function AppendFile($filename, $content) {
    // open the target file for appending
    $mode = 'a';

    $outFile = fopen($filename, $mode) or die("Cannot open file $filename with mode $mode");
    if (!$outFile) {
        echo "Failed to open file $filename - mode $mode";
        http_response_code(500);
        exit;
    }

    echo "Writing text file $filename\n";

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
    exitCode(500);
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

function exitCode($code, $msg=null) {
    if (null !== $msg)
        echo $msg;
    http_response_code($code);
    //header('Connection: close');
    header('Content-Length: '.ob_get_length());
    ob_end_flush(); // Strange behaviour, will not work
    flush(); // Unless both are called !
    exit;
}
