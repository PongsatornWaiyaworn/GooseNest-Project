package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BankAccount struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email       string             `bson:"email" json:"email"`
	Type        string             `bson:"type" json:"type"` // 'bank' หรือ 'promptpay'
	BankName    string             `json:"bankName"`
	AccountNo   string             `json:"accountNo"`
	AccountName string             `json:"accountName"`
	IsDefault   bool               `bson:"isDefault" json:"isDefault"`
	CreatedAt   time.Time          `json:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt"`
}
