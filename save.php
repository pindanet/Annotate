<?php
$erasePrevious = true; // Test: removes all the text files older than 1 day
$encrypt = true;  // Encrypt the text
$badWords = array('viagra','cialis',
	'<p>hello! <a href="http://');
$savedir = "./saved/";

// Read form values
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $textpos = intval($_POST["textpos"]);
  $page = htmlspecialchars(stripslashes(trim($_POST["page"])));
  $passphrase = htmlspecialchars(stripslashes(trim($_POST["passphrase"])));
  $content = file_get_contents($_FILES["blobHTML"]["tmp_name"]);
} else {
  exit("Aborted: accept POST only!");
}

// Bad words filter
$badWordsDetected = 0;
$lowercaseContent = strtolower($content);
foreach ( $badWords as $word ) {
  if (strpos($lowercaseContent, $word) !== FALSE ) {
    exit("Aborted due to bad words!");
  }
}

if ($erasePrevious) { // Test: removes all the text files older than 1 day
  $days=1;
  //retrieve all files
  $theFiles = glob($savedir.'*.gz');
  //combine the date as a key for each file
  $theFiles = array_combine(array_map("filemtime", $theFiles), $theFiles);
  //sort them, descending order
  krsort($theFiles);
  foreach($theFiles as $fd){
    if(is_file($fd) && time() - filemtime($fd) >= $days*24*60*60) {
        unlink($fd);
        echo $fd . " is older than " . $days . " and has been deleted.<br>";
      }
  }
}
// Create directory to save the text files
if (!file_exists($savedir)) {
	if (!mkdir($savedir, 0777, true)) {
		die('Directory creation failed...');
	}
}

if ($encrypt) {
// If you want to encrypt the text
// https://encrypt-online.com/encrypt-and-decrypt-in-php
  $encrypt_method = "aes-256-cbc";
  $files = glob($savedir.'*.iv');
  $iv_length = openssl_cipher_iv_length($cipher = $encrypt_method);
  if (count($files) == 0) {
    $iv = openssl_random_pseudo_bytes($iv_length);
    $handle=fopen($savedir . base64_encode($iv) . ".iv","c") or exit("Creating file failed!");
    fclose($handle);
  } else {
    $info = pathinfo($files[0]);
    $file_name =  basename($files[0],'.'.$info['extension']);
    $iv = base64_decode($file_name);
  }
  if($iv_length != strlen($iv)) {
    exit("Encryption Error!");
  }
  $encrypted_string = openssl_encrypt($content, $encrypt_method, $passphrase, $options = OPENSSL_RAW_DATA, $iv);
}

// Save text
$bestand = $savedir . $textpos . $page . ".gz";
unlink($bestand);
$file=fopen($bestand,"a") or exit("Open file to write failed!");
fputs($file, gzcompress($encrypted_string, 9));
fclose($file);

$sendback = "<p style='color: blue; font-weight: bold; text-decoration: underline;'>The following text was saved in the file $bestand</p>";
if($encrypt) {
  $sendback .= openssl_decrypt(gzuncompress(file_get_contents($bestand)), $encrypt_method, $passphrase, $options = OPENSSL_RAW_DATA, $iv);
  $sendback .= "<h2>The encrypted text:</h2>";
}
$sendback .= $encrypted_string;
echo $sendback;
?>
