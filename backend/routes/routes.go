package routes

import (
	"go-auth-mongo/controllers"
	"go-auth-mongo/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.POST("/check", controllers.CheckDuplicate)
		auth.POST("/google", controllers.GoogleAuth)
		auth.POST("/change-password", controllers.ChangePassword)
	}

	otp := r.Group("/otp")
	{
		otp.POST("/send-otp", controllers.SendOTPHandler)
		otp.POST("/verify-otp", controllers.VerifyOTPHandler)
	}

	upload := r.Group("/upload")
	{
		upload.POST("/s3", controllers.UploadImage)
	}

	user := r.Group("/user")
	user.Use(middleware.JWTAuthMiddleware())
	{
		user.GET("/profile", controllers.GetProfile)
		user.PUT("/profile", controllers.UpdateProfile)
		user.GET("/profile/:email", controllers.GetProfileByEmail)
		user.GET("/favorites", controllers.GetUserFavorites)
	}

	listing := r.Group("/listing")
	listing.Use(middleware.JWTAuthMiddleware())
	{
		listing.GET("/:id/full", controllers.GetListingWithUserByID)
		listing.GET("/:id/decrypted", controllers.GetDecryptedListingByID)
		listing.GET("/:id", controllers.GetListingByID)
		listing.POST("/", controllers.CreateListing)
		listing.GET("/", controllers.GetListingsUser)
		listing.GET("/all", controllers.GetListingsAll)
		listing.PUT("/:id", controllers.UpdateListing)
		listing.DELETE("/:id", controllers.DeleteListing)
		listing.PUT("/:id/favorite", controllers.ToggleFavoriteListing)
		listing.GET("/:id/isFavorited", controllers.IsListingFavorited)
	}

	bank := r.Group("/bank-account")
	bank.Use(middleware.JWTAuthMiddleware())
	{
		bank.POST("/", controllers.CreateBankAccount)
		bank.GET("/", controllers.GetBankAccounts)
		bank.PUT("/:id", controllers.UpdateBankAccount)
		bank.DELETE("/:id", controllers.DeleteBankAccount)
		bank.PATCH("/set-default/:id", controllers.SetDefaultBankAccount)
		bank.GET("/default", controllers.GetDefaultBankAccount)
	}

	bank_ := r.Group("/bank")
	{
		bank_.GET("/:id", controllers.GetBankAccountByID)
	}

	chat := r.Group("/chat")
	chat.Use(middleware.JWTAuthMiddleware())
	{
		chat.POST("/group", controllers.CreateGroupHandler)
		chat.GET("/groups", controllers.GetUserChatsHandler)
		chat.GET("/groups/:id", controllers.GetGroupByIDHandler)
		chat.GET("/messages/:id", controllers.GetMessagesHandler)
		chat.PUT("/groups/:id/read-status", controllers.UpdateReadStatusHandler)
		chat.PATCH("/groups/:id/confirm", controllers.ConfirmTradeHandler)
		chat.GET("/groups/confirmed", controllers.GetConfirmedTradeGroupsHandler)
	}

	payment := r.Group("/payment")
	payment.Use(middleware.JWTAuthMiddleware())
	{
		payment.POST("/generateQR", controllers.NewPaymentController().CreateQR)
	}

	report := r.Group("/report")
	report.Use(middleware.JWTAuthMiddleware())
	{
		report.POST("/", controllers.CreateReportIssue)
		report.POST("/post", controllers.CreateReportIssuePost)
	}

	r.GET("/ws/chat", controllers.WebSocketHandlerChat)
	r.GET("/ws/listen", controllers.WebSocketHandlerListenAllGroups)
	r.GET("/ws/watch-new-groups", controllers.WebSocketHandlerWatchNewGroups)
}
