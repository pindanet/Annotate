<?php
$savedir = "./saved/";

// Read form values
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $page = htmlspecialchars(stripslashes(trim($_POST["page"])));
  $textpos = htmlspecialchars(stripslashes(trim($_POST["textpos"])));
} else {
  exit("Aborted: accept POST only!");
}
unlink($savedir . $textpos . $page . ".gz");
?>
