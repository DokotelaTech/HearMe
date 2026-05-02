<?php
session_start();
require "db_connect.php";

echo"this file is working";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = $_POST["email"];
    $password = $_POST["password"];

    // Fetch user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Verify hashed password
        if (password_verify($password, $user["password"])) {

            // Store session data
            $_SESSION["user_id"] = $user["id"];
            $_SESSION["username"] = $user["username"];

            echo "Login successful!";
            // header("Location: dashboard.php");
            exit();

        } else {
            echo "Invalid password.";
        }
    } else {
        echo "User not found.";
    }
}
?>