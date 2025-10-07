package utils

import (
	"log"
	"net/smtp"
	"os"

	"github.com/joho/godotenv"
)

func SendEmail(to string, otp string) error {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORDAPP")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := "Your OTP Code"

	body := `
		<html>
		<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
			<div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
			<h2 style="color: #333;">รหัสยืนยัน (OTP) ของคุณ</h2>
			<p style="font-size: 18px;">กรุณาใช้รหัสด้านล่างเพื่อยืนยันตัวตนของคุณ:</p>
			<div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #007BFF; margin: 20px 0;">` + otp + `</div>
			<p style="color: #555;">รหัสนี้จะมีอายุการใช้งาน <strong>5 นาที</strong> กรุณาอย่าเปิดเผยรหัสนี้ให้ผู้อื่นทราบ</p>
			<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
			<p style="font-size: 14px; color: #999;">หากคุณไม่ได้ทำรายการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
			</div>
		</body>
		</html>
		`

	message := []byte("From: GooseNest <" + from + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		body)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message)
	return err
}
