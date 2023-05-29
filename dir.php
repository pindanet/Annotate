<?php
$erasePrevious = false; // Test: removes all the text files older than 1 day
$encrypt = true;  // Encrypt the text
$savedir = "./saved/";

// Read form values
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $page = htmlspecialchars(stripslashes(trim($_POST["page"])));
//  $passphrase = htmlspecialchars(stripslashes(trim($_POST["passphrase"])));
} else {
  exit("Aborted: accept POST only!");
}

if ($erasePrevious) { // Test: removes all the text files older than 1 day
  $days=1;
  //retrieve all files
  $theFiles = glob($savedir . '*.gz');
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
// Check directory to save the text files
if (!file_exists($savedir)) {
	die('Save Directory does not exist...');
}

$theFiles = glob($savedir . '*' . $page . '.gz');
echo json_encode($theFiles);
?>
