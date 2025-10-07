package utils

import (
	"log"
	"net/smtp"
	"os"

	"github.com/joho/godotenv"
)

func SendInterestNotificationEmail(to string) error {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORDAPP")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := "แจ้งเตือน: มีคนสนใจสินค้าของคุณ"

	URL := "https://goosenest.example.com/chat"

	body := `
		<html>
		<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
			<div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
				<h2 style="color: #333;">มีคนสนใจสินค้าของคุณ</h2>
				<p style="font-size: 18px;">ลูกค้าส่งข้อความหาคุณเพื่อสอบถามเกี่ยวสินค้าของคุณ</p>
				<p style="font-size: 16px;">กรุณาเข้าสู่ระบบและตรวจสอบรายละเอียดเพิ่มเติมได้ที่ปุ่มด้านล่าง</p>
				<a href="` + URL + `" style="display:inline-block; padding: 10px 20px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px;">ไปยังช่องแชท</a>
				<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
				<p style="font-size: 14px; color: #999;">อีเมลฉบับนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้</p>
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

func SendNewMessageNotificationEmail(to string) error {

	from := os.Getenv("EMAIL")
	password := os.Getenv("PASSWORDAPP")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := "แจ้งเตือน: คุณได้รับข้อความใหม่"

	URL := "https://goosenest.example.com/chat"

	body := `
		<html>
		<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
			<div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
				<h2 style="color: #333;">คุณได้รับข้อความใหม่</h2>
				<p style="font-size: 18px;">ลูกค้าที่ห่างหายมาอย่างน้อย 30 นาที ส่งข้อความถึงคุณผ่านระบบ GooseNest</p>
				<p style="font-size: 16px;">คลิกปุ่มด้านล่างเพื่อตรวจสอบและตอบกลับ</p>
				<a href="` + URL + `" style="display:inline-block; padding: 10px 20px; background-color: #28A745; color: #ffffff; text-decoration: none; border-radius: 5px;">ไปยังช่องแชท</a>
				<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
				<p style="font-size: 14px; color: #999;">อีเมลฉบับนี้ถูกส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับอีเมลนี้</p>
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
