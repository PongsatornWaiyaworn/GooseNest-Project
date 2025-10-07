package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/omise/omise-go"
	"github.com/omise/omise-go/operations"
)

type QRRequest struct {
	Amount int64 `json:"amount"`
}

type QRResponse struct {
	SourceID string `json:"source_id"`
	QRImage  string `json:"qr_image"`
}

type PaymentController struct{}

func NewPaymentController() *PaymentController {
	return &PaymentController{}
}

func (ctl *PaymentController) CreateQR(c *gin.Context) {
	var body QRRequest
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found - using environment variables from system")
	}

	// อ่าน key จาก environment
	publicKey := os.Getenv("OMISE_PUBLICKEY")
	secretKey := os.Getenv("OMISE_SECRETKEY")
	log.Printf("OMISE_PUBLICKEY: %s", publicKey)
	log.Printf("OMISE_SECRETKEY: %s", secretKey)

	if publicKey == "" || secretKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OMISE_PUBLICKEY or OMISE_SECRETKEY is not set"})
		return
	}

	client, err := omise.NewClient(publicKey, secretKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot init client: " + err.Error()})
		return
	}

	source := &omise.Source{}
	err = client.Do(source, &operations.CreateSource{
		Type:     "promptpay",
		Amount:   body.Amount * 100,
		Currency: "THB",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Source data: %+v\n", source)

	qrImage := ""
	if source.ScannableCode != nil && source.ScannableCode.Image != nil {
		qrImage = source.ScannableCode.Image.DownloadURI
		log.Println("QR Image URL:", qrImage)
	} else {
		log.Println("No QR image found in source.ScannableCode")
	}

	c.JSON(http.StatusOK, QRResponse{
		SourceID: source.ID,
		QRImage:  qrImage,
	})

	jsonData, _ := json.MarshalIndent(source, "", "  ")
	log.Println("Source full JSON:", string(jsonData))
}
